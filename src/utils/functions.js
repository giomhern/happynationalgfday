const randNumInRange = (min, max) => {
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

const normRand = () => {
  let val = 0;
  for (let i = 0; i < 6; i++) {
    val += Math.random();
  }

  return val / 6;
};

export { randNumInRange, normRand };
