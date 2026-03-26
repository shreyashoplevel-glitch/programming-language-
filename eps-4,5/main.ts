import Parser from "./frontend/parser.ts";
import { evaluate } from "./runtime/interpeter.ts";
import Environment from "./runtime/environment.ts";
import { BooleanVal, NumberVal, NullVal } from "./runtime/values.ts";

repl();

function repl() {
  const parser = new Parser();
  const env = new Environment();

  // Create Default Global Env
  env.declareVar("true", { value: true, type: "Boolean" } as BooleanVal, true);
  env.declareVar("false", { value: false, type: "Boolean" } as BooleanVal, true);
  env.declareVar("null", { value: null, type: "Null" } as NullVal, true);

  console.log("\nRepl v0.1");

  // Continue Repl Until User Stops Or Types `exit`
  while (true) {
    const input = prompt("> ");
    // Check for no user input or exit keyword.
    if (!input || input.includes("exit")) {
      Deno.exit(1);
    }

    // Produce AST From sourc-code
    const program = parser.produceAST(input);
    const results = evaluate(program, env);
    console.log(results);

    console.log("----------\n\n");
  }
}
