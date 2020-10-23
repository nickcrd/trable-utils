import Command from "./Command";
import yargs from "yargs";

export default class CommandManager {

    public registerCommand(command: Command) {
        yargs.command(command);
        return this
    }

    public registerCommandExperimental(command: Command) {
        yargs.command(command.command, command.describe, {}, command.handler.bind(command));
        return this
    }

    public build() {
        yargs.help().argv
    }
}