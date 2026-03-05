import fs from 'fs';
import path from 'path';

const dir = 'c:\\Users\\MohamedHedi BenSalah\\Desktop\\Bpootify-web\\app\\data\\7P';

const files = fs.readdirSync(dir).filter(f => f.endsWith('.json') && f !== 'cleanup_all.js');

files.forEach(fileName => {
    const filePath = path.join(dir, fileName);
    const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));

    Object.keys(data).forEach(key => {
        const questions = data[key];
        if (Array.isArray(questions)) {
            data[key] = questions.map(q => {
                return {
                    question: (q.question && typeof q.question === 'object') ? q.question.fr : q.question,
                    options: Array.isArray(q.options) ? q.options.map(opt => (typeof opt === 'object' ? opt.fr : opt)) : [],
                    correct: (q.correct && typeof q.correct === 'object') ? q.correct.fr : q.correct
                };
            });
        }
    });

    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
    console.log(`Processed ${fileName}`);
});
