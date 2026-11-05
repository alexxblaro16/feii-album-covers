// Instructor fixture — throws on mount so the shell error boundary can be exercised.

export default function Route() {
  throw new Error('_fixture-throw: intentional render failure');
}
