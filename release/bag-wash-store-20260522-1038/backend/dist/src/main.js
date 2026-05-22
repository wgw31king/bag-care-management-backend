"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const common_1 = require("@nestjs/common");
const core_1 = require("@nestjs/core");
const fs_1 = require("fs");
const path_1 = require("path");
const app_module_1 = require("./app.module");
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    const port = Number(process.env.PORT ?? 3001);
    app.setGlobalPrefix('api');
    app.enableCors({
        origin: [
            'http://localhost:5173',
            'http://127.0.0.1:5173',
            `http://localhost:${port}`,
            `http://127.0.0.1:${port}`,
        ],
        credentials: true,
    });
    app.useGlobalPipes(new common_1.ValidationPipe({
        whitelist: true,
        transform: true,
        forbidNonWhitelisted: true,
        errorHttpStatusCode: common_1.HttpStatus.UNPROCESSABLE_ENTITY,
    }));
    const uploadDir = process.env.UPLOAD_DIR ?? 'uploads';
    app.useStaticAssets((0, path_1.join)(process.cwd(), uploadDir), { prefix: '/uploads' });
    const frontendDist = process.env.FRONTEND_DIST;
    if (frontendDist) {
        const abs = (0, path_1.join)(process.cwd(), frontendDist);
        if ((0, fs_1.existsSync)((0, path_1.join)(abs, 'index.html'))) {
            app.useStaticAssets(abs);
            app.use((req, res, next) => {
                if (req.method !== 'GET' && req.method !== 'HEAD') {
                    return next();
                }
                const p = req.path;
                if (p.startsWith('/api') || p.startsWith('/uploads')) {
                    return next();
                }
                return res.sendFile((0, path_1.join)(abs, 'index.html'));
            });
            console.log(`Frontend static: ${abs}`);
        }
    }
    await app.listen(port);
    console.log(`Bag Wash running at http://localhost:${port}`);
    console.log(`API: http://localhost:${port}/api`);
}
bootstrap();
//# sourceMappingURL=main.js.map