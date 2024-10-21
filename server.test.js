import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import axios from 'axios';
import {createServer} from "./server";

describe('Counter Server', () => {
    let server;
    const port = 3001;
    const baseURL = `http://localhost:${port}`;

    beforeAll(() => {
        const instance = createServer(port, []);
        server = instance.server;
    });

    afterAll(() => {
        server.close();
    });

    it('should return the counter with a default value', async () => {
        const response = await axios.get(`${baseURL}/counter`);
        expect(response.data.counter).toBe(0);
    });

    it('should increment the counter', async () => {
        const incrementResponse = await axios.post(`${baseURL}/increment`);
        expect(incrementResponse.data).toContain('Counter incremented to 1');

        const response = await axios.get(`${baseURL}/counter`);
        expect(response.data.counter).toBe(1);
    });

    it('should synchronize the counter with a higher value', async () => {
        const syncResponse = await axios.post(`${baseURL}/sync`, { counter: 5 });
        expect(syncResponse.data.counter).toBe(5);

        const response = await axios.get(`${baseURL}/counter`);
        expect(response.data.counter).toBe(5);
    });
});