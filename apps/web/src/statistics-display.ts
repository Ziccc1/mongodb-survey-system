export function optionPercentage(count: number, answeredCount: number): number {
  return answeredCount > 0 ? Math.round(count / answeredCount * 1000) / 10 : 0;
}

export function defaultShowAverage(title: string): boolean {
  // A presentation default only: never changes the question type or old snapshots.
  return !/(手机号|手机号码|电话号码|联系电话|联系号码|电话|\bphone\b|\bmobile\b)/i.test(title);
}
