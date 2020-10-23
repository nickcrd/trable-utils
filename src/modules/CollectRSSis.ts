import Command from "./Command";
import {Arguments} from "yargs";
import noble, {Peripheral} from '@abandonware/noble'
import ora from "ora";
import { Invisible } from 'enquirer'
import KalmanFilter from "../utils/KalmanFilter";
import {getDefaultKalmanFilter} from "../utils/kalmanUtils";

export default class CollectRSSIs extends Command {

    private advertisementId: string = "N/A";
    private rssiMeasurements: number[] = [];
    private kalman: KalmanFilter = getDefaultKalmanFilter()

    constructor(command: string, description: string) {
        super(command, description);
    }

    async handler(args: Arguments<{}>): Promise<void> {
        // Setup
        this.advertisementId = "TRABLE-DEBUG-" + Math.floor(Math.random() * 10000)
        const spinner = ora('Preparing...').start();

        noble.on('discover', this.handleScannedPeripheral.bind(this));
        spinner.succeed()

        console.log("Put your Smartphone 1m away from the beacon.")
        console.log("Start Debug App and enter ID " + this.advertisementId)

        await new Invisible({
            name: 'answer',
            message: 'When ready, press Enter to start measurement.',
            initial: true
        }).run();

        spinner.start("Measuring RSSI...")

        await noble.startScanningAsync([], true)
        await this.sleep(15000);

        await noble.stopScanning()
        spinner.succeed("Measurements for 1m done")

        console.log(" ")
        console.log(" RSSI MEASUREMENTS FOR 1m: ")
        console.log(" " + this.rssiMeasurements)
        console.log(" ")
    }

    private async sleep(ms: number) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    private calculateDistance(rssi: number, rssi1m: number, pathLossParameter: number) {
        return Math.pow(10, (rssi - rssi1m) / (-10 * pathLossParameter))
    }

    private getAvg(): number{
        var sum = 0;
        this.rssiMeasurements.forEach((value => sum+=value))
        return sum/this.rssiMeasurements.length;
    }


    private handleScannedPeripheral(peripheral: Peripheral) {
        if (!peripheral.advertisement.localName) {
            return
        }

        const name = peripheral.advertisement.localName
        if (!name.startsWith("TRABLE-DEBUG-")) {
            return;
        }

       // const rssi = this.kalman.filter(peripheral.rssi)
        this.rssiMeasurements.push(peripheral.rssi)
    }
}