import { Request, Response, NextFunction } from 'express';

export const requestLogger = (req: Request, res: Response, next: NextFunction) => {
  const start = Date.now();
  
  // Логируем входящий запрос
  console.log('\n📥 Request:', {
    method: req.method,
    url: req.url,
    timestamp: new Date().toLocaleTimeString()
  });
  
  if (req.method === 'POST' || req.method === 'PUT') {
    if (req.headers['content-type']?.includes('multipart/form-data')) {
      if (req.file) {
        console.log('📎 File:', {
          fieldname: req.file.fieldname,
          originalname: req.file.originalname,
          mimetype: req.file.mimetype,
          size: `${(req.file.size / 1024).toFixed(2)} KB`
        });
      }
    } else if (req.body && Object.keys(req.body).length > 0) {
      console.log('📦 Body:', req.body);
    }
  }

  // Перехватываем ответ
  const originalSend = res.send;
  res.send = function (body) {
    const duration = Date.now() - start;
    
    // Логируем ответ
    console.log('📤 Response:', {
      status: res.statusCode,
      duration: `${duration}ms`,
      body: typeof body === 'string' ? JSON.parse(body || '{}') : body
    });
    console.log('-------------------\n');
    
    return originalSend.call(this, body);
  };

  next();
}; 