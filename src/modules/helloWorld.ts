import {Arguments, CommandModule} from "yargs";
import Command from "./Command";

export default class HelloWorld extends Command {

    constructor() {
        super("helloWorld <name>", "Says hello");
    }

    handler(argv: Arguments): void {
        console.log("Hello World " + argv.name)
    }

}