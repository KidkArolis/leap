define(function () {
  return function (desc, test) {
    if (!test) {
      throw new Error("assertion failed: " + desc);
    }
  };
});