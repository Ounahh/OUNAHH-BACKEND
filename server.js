const express = require('express');
const cors = require('cors');
const MetaApi = require('metaapi.cloud-sdk').default;

const app = express();
app.use(cors());
app.use(express.json());

// Replace with your token from https://metaapi.cloud
const META_API_TOKEN = 'YOUR_METAAPI_TOKEN_HERE';
const api = new MetaApi(META_API_TOKEN);

app.post('/api/connect-broker', async (req, res) => {
    const { login, password, serverName } = req.body;
    try {
        const account = await api.metatraderAccountApi.createAccount({
            name: `Trader-${login}`,
            type: 'cloud',
            login: login,
            password: password,
            server: serverName,
            platform: 'mt5'
        });
        await account.deploy();
        await account.waitConnected();
        res.json({ success: true, accountId: account.id });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

app.get('/api/account-stats/:accountId', async (req, res) => {
    try {
        const account = await api.metatraderAccountApi.getAccount(req.params.accountId);
        const connection = account.getRPCConnection();
        await connection.connect();
        const info = await connection.getAccountInformation();
        const positions = await connection.getPositions();
        res.json({ connected: true, balance: info.balance, equity: info.equity, positions });
    } catch (err) {
        res.status(500).json({ connected: false, error: err.message });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Backend running on port ${PORT}`));