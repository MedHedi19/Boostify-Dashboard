/**
 * API Route: /api/certificate-payment
 *
 * GET  ?userId=<id>           → returns { certificatePaid, certificatePaidAt, certificatePaidNote }
 * POST body: { userId, paid?, note? }  → sets / toggles payment status, returns updated doc
 *
 * Used exclusively by the Admin Dashboard (User Reports detail page).
 */
import { json } from "@react-router/node";
import connectDB from '../../lib/db.server';
import User from '../../models/User.server';

// ── GET: read payment status ──────────────────────────────────────────────
export async function loader({ request }: { request: Request }) {
  await connectDB();
  const url = new URL(request.url);
  const userId = url.searchParams.get('userId');

  if (!userId) {
    return json({ error: 'userId required' }, { status: 400 });
  }

  try {
    const user = await User.findById(userId)
      .select('certificatePaid certificatePaidAt certificatePaidNote firstName lastName email')
      .lean();
    if (!user) {
      return json({ error: 'User not found' }, { status: 404 });
    }

    return json({
      certificatePaid: (user as any).certificatePaid ?? false,
      certificatePaidAt: (user as any).certificatePaidAt ?? null,
      certificatePaidNote: (user as any).certificatePaidNote ?? null,
    });
  } catch (e: any) {
    console.error('certificate-payment GET error', e);
    return json({ error: e.message || 'Server error' }, { status: 500 });
  }
}

// ── POST: set / toggle payment status ────────────────────────────────────
export async function action({ request }: { request: Request }) {
  await connectDB();

  try {
    const body = await request.json();
    const { userId, paid, note } = body ?? {};

    if (!userId) {
      return json({ error: 'userId required' }, { status: 400 });
    }

    const user = await User.findById(userId);
    if (!user) {
      return json({ error: 'User not found' }, { status: 404 });
    }

    // If `paid` is explicitly provided use it; otherwise toggle current value
    const newPaid = typeof paid === 'boolean' ? paid : !(user as any).certificatePaid;

    await User.updateOne(
      { _id: user._id },
      {
        certificatePaid: newPaid,
        certificatePaidAt: newPaid ? new Date() : null,
        ...(note !== undefined && { certificatePaidNote: note }),
      }
    );

    return json({
      success: true,
      certificatePaid: newPaid,
      certificatePaidAt: newPaid ? new Date().toISOString() : null,
      message: newPaid ? 'Payment confirmed ✅' : 'Payment removed ❌',
    });
  } catch (e: any) {
    console.error('certificate-payment POST error', e);
    return json({ error: e.message || 'Server error' }, { status: 500 });
  }
}

