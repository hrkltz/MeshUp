export class IndexedDBUtil {
    public static async clearObjectStore(store: IDBObjectStore): Promise<void> {
        return new Promise((resolve, reject) => {
            const request = store.clear();
            request.onsuccess = (event) => {
                resolve();
            };
            request.onerror = (event) => {
                reject(request.error);
            };
        });
    };


    public static async deleteRecord(store: IDBObjectStore, key: IDBValidKey): Promise<void> {
        return new Promise((resolve, reject) => {
            const request = store.delete(key);
            request.onsuccess = (event) => {
                resolve();
            };
            request.onerror = (event) => {
                reject(request.error);
            };
        });
    };


    public static async getRecord(store: IDBObjectStore, key: IDBValidKey): Promise<any> {
        return new Promise((resolve, reject) => {
            const request = store.get(key);
            request.onsuccess = (event) => {
                resolve(request.result);
            };
            request.onerror = (event) => {
                reject(request.error);
            };
        });
    };


    public static async openDatabase(dbName: string, version: number, upgradeCallback: (database: IDBDatabase) => void): Promise<IDBDatabase> {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open(dbName, version);
            request.onupgradeneeded = (event) => {
                const database = request.result;
                upgradeCallback(database);
            };
            request.onsuccess = (event) => {
                resolve(request.result);
            };
            request.onerror = (event) => {
                reject(request.error);
            };
        });
    };


    public static async openObjectStore(database: IDBDatabase, storeName: string, mode: IDBTransactionMode): Promise<IDBObjectStore> {
        return database.transaction(storeName, mode).objectStore(storeName);
    };


    public static async putRecord(store: IDBObjectStore, key: IDBValidKey, record: any): Promise<void> {
        return new Promise((resolve, reject) => {
            const request = store.put(record, key);
            request.onsuccess = (event) => {
                resolve();
            };
            request.onerror = (event) => {
                reject(request.error);
            };
        });
    };
};
