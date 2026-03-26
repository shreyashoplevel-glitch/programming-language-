import { RunTimeVal, NumberVal, NullVal, ObjectVal } from "./values.ts";
import {
  Stmt,
  NumericLiteral,
  BinaryExpr,
  Program,
  Identifier,
  VarDeclaration,
  AssignmentExpr,
  ObjectLiteral,
} from "../frontend/ast.ts";
import Environment from "./environment.ts";

function evaluate_program(program: Program, env: Environment): RunTimeVal {
  let last_evaluated: RunTimeVal = { value: null, type: "Null" } as NullVal;
  for (const statement of program.body) {
    last_evaluated = evaluate(statement, env);
  }
  return last_evaluated;
}

function evaluate_numeric_binary_expr(
  lhs: NumberVal,
  rhs: NumberVal,
  operator: string,
): NumberVal {
  let result = 0;
  if (operator == "+") {
    result = lhs.value + rhs.value;
  } else if (operator == "-") {
    result = lhs.value - rhs.value;
  } else if (operator == "*") {
    result = lhs.value * rhs.value;
  } else if (operator == "/") {
    result = lhs.value / rhs.value;
  } else if (operator == "%") {
    result = lhs.value % rhs.value;
  }
  return { value: result, type: "Number" } as NumberVal;
}

function evaluate_binary_expr(
  binop: BinaryExpr,
  env: Environment,
): RunTimeVal {
  const lhs = evaluate(binop.left, env);
  const rhs = evaluate(binop.right, env);
  if (lhs.type == "Number" && rhs.type == "Number") {
    return evaluate_numeric_binary_expr(
      lhs as NumberVal,
      rhs as NumberVal,
      binop.operator,
    );
  }
  return { value: null, type: "Null" } as NullVal;
}

function evaluate_identifier(
  ident: Identifier,
  env: Environment,
): RunTimeVal {
  const val = env.lookupVar(ident.symbol);
  return val;
}

function evaluate_assignment(
  node: AssignmentExpr,
  env: Environment,
): RunTimeVal {
  if (node.assignee.kind !== "Identifier") {
    throw `Invalid assignment target ${JSON.stringify(node.assignee)}`;
  }

  const varname = (node.assignee as Identifier).symbol;
  return env.assignVar(varname, evaluate(node.value, env));
}

function evaluate_object_expr(
  obj: ObjectLiteral,
  env: Environment,
): RunTimeVal {
  const object = { type: "Object", properties: new Map() } as ObjectVal;
  for (const { key, value } of obj.properties) {
    const runtimeVal = (value == undefined)
      ? env.lookupVar(key)
      : evaluate(value, env);

    object.properties.set(key, runtimeVal);
  }

  return object;
}

function evaluate_var_declaration(
  declaration: VarDeclaration,
  env: Environment,
): RunTimeVal {
  const value = declaration.value
    ? evaluate(declaration.value, env)
    : { type: "Null", value: null } as NullVal;
  return env.declareVar(declaration.identifier, value, declaration.constant);
}

export function evaluate(astNode: Stmt, env: Environment): RunTimeVal {
  switch (astNode.kind) {
    case "NumericLiteral":
      return {
        value: (astNode as NumericLiteral).value,
        type: "Number",
      } as NumberVal;
    case "NullLiteral":
      return { value: null, type: "Null" } as NullVal;
    case "Identifier":
      return evaluate_identifier(astNode as Identifier, env);
    case "ObjectLiteral":
      return evaluate_object_expr(astNode as ObjectLiteral, env);
    case "AssignmentExpr":
      return evaluate_assignment(astNode as AssignmentExpr, env);
    case "BinaryExpr":
      return evaluate_binary_expr(astNode as BinaryExpr, env);
    case "Program":
      return evaluate_program(astNode as Program, env);
    case "VarDeclaration":
      return evaluate_var_declaration(astNode as VarDeclaration, env);
    default:
      console.error(
        "This AST Node has not yet been setup for interpretation.",
        astNode,
      );
      Deno.exit(0);
  }
}
