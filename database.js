import sql from 'mssql';

export default class Database {
    constructor(config) {
        this.config = config;
        this.poolconnection = new sql.ConnectionPool(config);
        this.connected = false;
    }

    async connect() {
        try {
            if (!this.connected) {
                await this.poolconnection.connect();
                this.connected = true;
                console.log('Database connection successful');
            }
        } catch (error) {
            console.error('Error connecting to database:', error);
        }
    }

    async executeQuery(query) {
        await this.connect();
        try {
            const result = await this.poolconnection.request().query(query);
            return result;
        } catch (error) {
            console.error('Error executing query:', error);
            throw error;
        }
    }

    // Example CRUD operations
    async createUser(data) {
        const query = `INSERT INTO Brugere (brugernavn, kodeord, alder, vægt, køn) VALUES (@brugernavn, @kodeord, @alder, @vægt, @køn)`;
        return await this.executeQuery(query);
    }
}
