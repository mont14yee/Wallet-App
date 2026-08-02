import Decimal from 'decimal.js';

export const toCents = (amount: number): number => Math.round(amount * 100);
export const fromCents = (cents: number): number => cents / 100;

export const addMoney = (...amounts: number[]): number => {
    return amounts.reduce((acc, val) => acc.plus(new Decimal(val)), new Decimal(0)).toDecimalPlaces(2, Decimal.ROUND_HALF_UP).toNumber();
};

export const subtractMoney = (a: number, b: number): number => {
    return new Decimal(a).minus(new Decimal(b)).toDecimalPlaces(2, Decimal.ROUND_HALF_UP).toNumber();
};

export const multiplyMoney = (a: number, b: number): number => {
    return new Decimal(a).times(new Decimal(b)).toDecimalPlaces(2, Decimal.ROUND_HALF_UP).toNumber();
};

export const divideMoney = (a: number, b: number): number => {
    return new Decimal(a).dividedBy(new Decimal(b)).toDecimalPlaces(2, Decimal.ROUND_HALF_UP).toNumber();
};
