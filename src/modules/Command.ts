import {Arguments, CommandModule} from "yargs";

export default abstract class Command implements CommandModule {
    command: ReadonlyArray<string> | string;
    describe: string;

    constructor(command: string, description: string) {
        this.command = command;
        this.describe = description;
    }

    abstract handler(args: Arguments<{}>): void;
}