// const setupApp = require('../app');
import setUpApp from '../index.js';

const app = setUpApp();

const port = process.env.PORT ;

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});


export default app;