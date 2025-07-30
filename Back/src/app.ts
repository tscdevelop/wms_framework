import createError, { HttpError } from 'http-errors';
import express, { Request, Response, NextFunction } from 'express';
import path from 'path';
import cookieParser from 'cookie-parser';
import logger from 'morgan';
import cors from 'cors';

// สำหรับ typeORM
import 'reflect-metadata';
import { AppDataSource } from './config/app-data-source';

import { initSocket } from './services/socket.service'; // ✅ นำเข้า initSocket

import http from 'http';

// ใช้ import สำหรับไฟล์ TypeScript
import indexRouter from './routes/index';
import usersRouter from './routes/users';
import getusersRouter from './routes/getusers';
import imagesRouter from './routes/Images';
import checklistRouter from './routes/checklist';
import registerRouter from './routes/register';
import userRouter from './routes/user.routes';
import employeeRouter from './routes/employee.routes';
import roleRouter from './routes/role.routes';
import menuRouter from './routes/menu.routes';
import dropdownRouter from './routes/dropdown.routes';
import factoryRouter from './routes/factory.routes';
import warehouseRouter from './routes/warehouse.routes';
import zoneRouter from './routes/zone.routes';
import locationRouter from './routes/location.routes';
import supplierRouter from './routes/supplier.routes';
import unitRouter from './routes/unit.routes';
import rawmaterialRouter from './routes/raw_material.routes';
import finishedgoodsRouter from './routes/finished_goods.routes';
import semiRouter from './routes/semi.routes';
import toolingRouter from './routes/tooling.routes';
import transportyardRouter from './routes/transport_yard.routes';
import rawmaterialIfmRouter from './routes/raw_material_ifm.routes';
import finishedgoodsIfmRouter from './routes/finished_goods_ifm.routes';
import semiIfmRouter from './routes/semi_ifm.routes';
import toolingIfmRouter from './routes/tooling_ifm.routes';
import criteriaRouter from './routes/criteria.routes';
import inboundRouter from './routes/inbound_tl.routes';
import inbrmRouter from './routes/inbound_rm.routes';
import inbfgRouter from './routes/inbound_fg.routes';
import inbsemiRouter from './routes/inbound_semi.routes';
import inbtlRouter from './routes/inbound_tl.routes';
import outbrmRouter from './routes/outbound_rm.routes';
import outbfgRouter from './routes/outbound_fg.routes';
import outbsemiRouter from './routes/outbound_semi.routes';
import outbtlRouter from './routes/outbound_tl.routes';
import transactionLogRouter from './routes/log.routes';
import bomRouter from './routes/bom.routers';
import notifapprovalRouter from './routes/notification.routes';
import accessRouter from './routes/access.routes';
import inventoryRouter from './routes/inventory.routes';

import swaggerApp from './swagger'; // นำเข้า swagger

import fileUpload from 'express-fileupload'; // นำเข้า fileupload

// นำเข้า i18next และ dependencies ที่จำเป็น
import i18next from 'i18next';
import Backend from 'i18next-fs-backend';
import middleware from 'i18next-http-middleware';

import { setLanguage } from './common/language.context'; // นำเข้า setLanguage
import { authenticateToken } from './common/auth.token';

const app = express();

const server = http.createServer(app);

initSocket(server); // ✅ เริ่มต้น WebSocket ที่นี่

// ตั้งค่า i18next
// วิธีการเปลี่ยนภาษาผ่าน client
// 1. ผ่าน query parameter:
// GET /api/users?lng=th
// 2. ผ่าน HTTP header:
// GET /api/users
// Header: Accept-Language: th
i18next
  .use(Backend)
  .use(middleware.LanguageDetector)
  .init({
    fallbackLng: 'th', // ภาษาเริ่มต้น (en,th)
    detection: {
      order: ['querystring', 'header', 'cookie'],
      caches: ['cookie']
    },
    backend: {
      loadPath: path.join(__dirname, 'locales/{{lng}}/{{ns}}.json'), // ที่อยู่ของไฟล์แปลภาษา
    },
  });
  
// ใช้ middleware ของ i18next
app.use(middleware.handle(i18next));

// Middleware เพื่อเซ็ตค่าภาษาใน Context
app.use((req, res, next) => {
  let language = 'en';
  
  // ตรวจสอบ query parameter
  if (typeof req.query.lng === 'string') {
    language = req.query.lng;
  } 
  // ตรวจสอบ HTTP header
  else if (typeof req.headers['accept-language'] === 'string') {
    language = req.headers['accept-language'];
  }
  
  setLanguage(language);
  next();
});

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(cors({ origin: '*', optionsSuccessStatus: 200 }));

// Use express-fileupload middleware
app.use(fileUpload());
app.use(express.json()); // ต้องใช้ เพื่ออ่านค่า req.body

app.use('/', indexRouter);
app.use('/usertest', usersRouter);
app.use('/users', getusersRouter);
app.use('/images', imagesRouter);
app.use('/checklist', checklistRouter);
app.use('/register', registerRouter);

app.use('/api/users', userRouter);
app.use('/api/employees', employeeRouter);
app.use('/api/roles', roleRouter);
app.use('/api/menus', menuRouter);

app.use('/api/dropdown', dropdownRouter);
app.use('/api/factory', factoryRouter);
app.use('/api/warehouse', warehouseRouter);
app.use('/api/zone', zoneRouter);
app.use('/api/location', locationRouter);
app.use('/api/supplier', supplierRouter);
app.use('/api/unit', unitRouter);
app.use('/api/raw-material-type', rawmaterialRouter);
app.use('/api/finished-goods-type', finishedgoodsRouter);
app.use('/api/semi-type', semiRouter);
app.use('/api/tooling-type', toolingRouter);
app.use('/api/transport-yard', transportyardRouter);
app.use('/api/raw-material-information', rawmaterialIfmRouter);
app.use('/api/finished-goods-information', finishedgoodsIfmRouter);
app.use('/api/semi-information', semiIfmRouter);
app.use('/api/tooling-information', toolingIfmRouter);
app.use('/api/criteria', criteriaRouter);
app.use('/api/inbound', inboundRouter);
app.use('/api/inbound-rm', inbrmRouter);
app.use('/api/inbound-fg', inbfgRouter);
app.use('/api/inbound-semi', inbsemiRouter);
app.use('/api/inbound-tl', inbtlRouter);
app.use('/api/outbound-rm', outbrmRouter);
app.use('/api/outbound-fg', outbfgRouter);
app.use('/api/outbound-semi', outbsemiRouter);
app.use('/api/outbound-tl', outbtlRouter);
app.use('/api/transaction-log', transactionLogRouter);
app.use('/api/bom', bomRouter);
app.use('/api/notif-approval', notifapprovalRouter);
app.use('/api/access', accessRouter);
app.use('/api/inventory', inventoryRouter);


// ใช้ Swagger UI
app.use(swaggerApp);

app.use((req: Request, res: Response, next: NextFunction) => {
  next(createError(404));
});

// error handler
app.use((err: HttpError, req: Request, res: Response, next: NextFunction) => {
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  res.status(err.status || 500);
  res.render('error');
});

// Create a connection to the database สำหรับ typeORM
// AppDataSource.initialize().then(async () => {
//   console.log('Connected to the database.');
//   // คุณสามารถเพิ่มโค้ดอื่นๆ ที่เกี่ยวข้องกับการใช้งาน TypeORM ที่นี่

//   // Start the Express server
//   const server = app.listen(process.env.PORT || 3202, () => {
//     const addressInfo = server.address();
//     if (addressInfo && typeof addressInfo === 'object') {
//       const host = addressInfo.address;
//       const port = addressInfo.port;
//       console.log(`Server is running on http://${host}:${port}`);
//     } else {
//       console.log(`Server is running on ${addressInfo}`);
//     }
//   });
// }).catch((error: any) => console.log('Error: ', error));


// Create a connection to the database สำหรับ typeORM
AppDataSource.initialize()
  .then(async () => {
    console.log("Connected to the database.");

    // ✅ ใช้ server ที่สร้างไว้ด้านบน
    const port = process.env.PORT || 3202;
    server.listen(port, () => {
      const addressInfo = server.address();
      const host =
        typeof addressInfo === "object" && addressInfo ? addressInfo.address : "localhost";
      const resolvedPort =
        typeof addressInfo === "object" && addressInfo ? addressInfo.port : port;

      // initializeSocket(server); // ✅ Initialize WebSocket หลังจาก database พร้อม
      console.log(`🚀 Server is running on http://${host}:${resolvedPort}`);
    });
  })
  .catch((error: any) => console.log("Error: ", error));

export default app;
