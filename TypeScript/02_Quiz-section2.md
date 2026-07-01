# 超TypeScript 完全ガイド 2026 — 小テスト1: セクション2の小テスト

---

## 質問1

正しい型注釈の方法はどれですか？

- A. `let apple string = 'string'`
- B. `let apple, string = 'string'`
- C. `let apple: string = 'string'`
- D. `let apple:: string = 'string'`

---

## 質問2

次のうち、オブジェクトの型注釈を正しく表しているものはどれですか？

**A.**

```typescript
const person: { name: string; age: number; } = {
  name: 'Jack',
  age: 21
}
```

**B.**

```typescript
const person: { name = string; age = number; } = {
  name: 'Jack',
  age: 21
}
```

**C.**

```typescript
const person: { name; string; age; number; } = {
  name: 'Jack',
  age: 21
}
```

**D.**

```typescript
const person: { name, string; age, number } = {
  name: 'Jack',
  age: 21
}
```

---

## 質問3

次のうち、配列の型注釈を正しく表しているものはどれですか？

- A. `const fruits: [string] = ["apple", "banana", "grape"];`
- B. `const fruits: string[] = ["apple", "banana", "grape"];`
- C. `const fruits: string = ["apple", "banana", "grape"];`
- D. `const fruits: {string} = ["apple", "banana", "grape"];`

---

## 質問4

次のうち、Union型の正しい記述はどれですか？

- A. `const unionType: number, string = 10;`
- B. `const unionType: number & string = 10;`
- C. `const unionType: number | string = 10;`
- D. `const unionType: number or string = 10;`

---

## 質問5

次のコードについて正しい説明はどれですか？

```typescript
type Size = "small" | "medium" | "large";
let mySize: Size = "medium";
```

- A. mySize には `"medium"` のみを格納できる。
- B. mySize には文字列型の値を格納できる。
- C. mySize には数値型の値を格納できる。
- D. mySize には `"small"`、`"medium"`、`"large"` のいずれかの値を格納できる。

---

## 質問6

次のうち、TypeScriptで関数を正しく定義する方法はどれですか？

**A.**

```typescript
function add(number a, number b): number {
  return a + b;
}
```

**B.**

```typescript
function add(a: number, b: number): number {
  return a + b;
}
```

**C.**

```typescript
function add(a: number, b: number) => number {
  return a + b;
}
```

---

## 解答

| 問題 | 正解 | 補足 |
|------|------|------|
| 質問1 | **C** | 型注釈は変数名のあとに `: 型名` を付ける。 |
| 質問2 | **A** | オブジェクト型は `{ プロパティ名: 型; ... }` の形式。区切りは `;`（または `,`）。 |
| 質問3 | **B** | 配列型は `型[]`。`[string]` は要素1つのタプル型になるので別物。 |
| 質問4 | **C** | Union型（いずれかの型）は `|`。`&` はインターセクション型（両方を満たす型）。 |
| 質問5 | **D** | リテラル型のUnionなので、定義した3つの値のいずれかだけを代入できる。 |
| 質問6 | **B** | 引数は `引数名: 型`、戻り値の型は `): 型 {` で指定する。`=> 型` はアロー関数の型注釈の書き方で関数宣言では使えない。 |
