import { calcularCostoEnvio } from './shipping';

describe('calcularCostoEnvio', () => {
    it('cobra $12.000 cuando no hay materas', () => {
        expect(calcularCostoEnvio([{ categoria: 'mates', precioVenta: 20000, cantidad: 1 }], 20000)).toBe(12000);
    });

    it('cobra $15.000 cuando hay una matera', () => {
        expect(calcularCostoEnvio([{ categoria: 'materas', precioVenta: 20000, cantidad: 1 }], 20000)).toBe(15000);
    });

    it('mantiene el envío pago cuando el subtotal es exactamente $130.000', () => {
        expect(calcularCostoEnvio([{ categoria: 'materas' }], 130000)).toBe(15000);
    });

    it('ofrece envío gratis cuando el subtotal supera $130.000', () => {
        expect(calcularCostoEnvio([{ categoria: 'materas' }], 130001)).toBe(0);
    });
});
