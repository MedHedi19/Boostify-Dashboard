/**
 * API Route: /api/certificate-payment
 *
 * GET  ?userId=<id>           → returns { certificatePaid, certificatePaidAt, certificatePaidNote }
 * POST body: { userId, paid?, note? }  → sets / toggles payment status, returns updated doc
 *
 * Used exclusively by the Admin Dashboard (User Reports detail page).
 */
import connectDB from '../../lib/db.server';
import User from '../../models/User.server';

export default async function handler(req: any, res: any) {
  await connectDB();

  try {
    // ── GET: read payment status ──────────────────────────────────────────────
    if (req.method === 'GET') {
      const userId = String(req.query?.userId || '');
      if (!userId) return res.status(400).json({ error: 'userId required' });

      const user = await User.findById(userId)
        .select('certificatePaid certificatePaidAt certificatePaidNote firstName lastName email')
        .lean();
      if (!user) return res.status(404).json({ error: 'User not found' });

      return res.json({
        certificatePaid: (user as any).certificatePaid ?? false,
        certificatePaidAt: (user as any).certificatePaidAt ?? null,
        certificatePaidNote: (user as any).certificatePaidNote ?? null,
      });
    }

    // ── POST: set / toggle payment status ────────────────────────────────────
    if (req.method === 'POST') {
      const { userId, paid, note } = req.body ?? {};
      if (!userId) return res.status(400).json({ error: 'userId required' });

      const user = await User.findById(userId);
      if (!user) return res.status(404).json({ error: 'User not found' });

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

      return res.json({
        success: true,
        certificatePaid: newPaid,
        certificatePaidAt: newPaid ? new Date().toISOString() : null,
        message: newPaid ? 'Payment confirmed ✅' : 'Payment removed ❌',
      });
    }

    res.setHeader('Allow', 'GET, POST');
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  } catch (e: any) {
    console.error('certificate-payment API error', e);
    return res.status(500).json({ error: e.message || 'Server error' });
  }
}

