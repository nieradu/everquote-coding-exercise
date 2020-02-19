export function randomObjFromArray(array: Array<any>) {
  return array[Math.floor(Math.random() * array.length)];
}
export function randomNumber(min: number, max: number) {
  return Math.floor(Math.random() * max) + min;
}

export function randomString(): string {
  return Math.random()
    .toString(36)
    .substring(2);
}

export function randomNumberInterval(min: number, max: number): number {
  return min + Math.floor((max - min) * Math.random());
}
