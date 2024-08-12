import { TLiteralValue, Type } from "@sinclair/typebox";

export function LiteralUnion<T extends TLiteralValue>(...literals: T[]) {
  return Type.Union(literals.map((literal) => Type.Literal(literal)));
}
