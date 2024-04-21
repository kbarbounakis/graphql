const { Service } = require("../src/Service");

describe('Service', () => {
    it('should create instance', () => {
        const service = new Service();
        expect(service).toBeInstanceOf(Service);
    });
});