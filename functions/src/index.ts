import { setGlobalOptions } from 'firebase-functions/v2';
import './config/firebase';

setGlobalOptions({ region: 'asia-southeast1' });

export { accountLogin } from './functions/visto-accountLogin/handler';
export { accountVerifyPin } from './functions/visto-accountVerifyPin/handler';

export { ingredientsGet } from './functions/visto-cafe-ingredientsGet/handler';
export { ingredientsManage } from './functions/visto-cafe-ingredientsManage/handler';

export { drinkManage } from './functions/visto-cafe-drinkManage/handler';

export { catalogGet } from './functions/visto-catalogGet/handler';

export { orderProcess } from './functions/visto-orderProcess/handler';

export { metricsGet } from "./functions/visto-metricsGet/handler";
