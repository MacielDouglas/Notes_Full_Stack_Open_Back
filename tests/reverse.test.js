// o código de teste importa a função que será testada e a atribui a uma variável chamada reverse
const reverse = require('../utils/for_testing').reverse;

test('reverse of a', () => {
  const result = reverse('a');

  expect(result).toBe('a');
});

test('reverse of react', () => {
  const result = reverse('react');

  expect(result).toBe('tcaer');
});

test('reverse of releveler', () => {
  const result = reverse('releveler');

  expect(result).toBe('releveler');
});

// test('palindrome of react', () => {
//   const result = reverse('react');

//   expect(result).toBe('tkaer');
// });
