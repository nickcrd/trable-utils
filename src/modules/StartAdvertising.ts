import Command from "./Command";
import {Arguments} from "yargs";
import noble, {Peripheral} from '@abandonware/noble'
import ora from "ora";
import { Invisible } from 'enquirer'
import KalmanFilter from "../utils/KalmanFilter";
import {getDefaultKalmanFilter} from "../utils/kalmanUtils";

export default class BluetoothModule extends Command {

    private advertisementId: string = "N/A";
    private rssiMin: number = 0;
    private rssiMax: number = 0;
    private rssiMeasurements: number[] = [];
    private kalman: KalmanFilter = getDefaultKalmanFilter()

    constructor(command: string, description: string) {
        super(command, description);
    }

    async handler(args: Arguments<{}>): Promise<void> {
        // Setup
        const spinner = ora('Preparing...').start();

        noble.on('discover', this.handleScannedPeripheral.bind(this));
        spinner.succeed()

        while (true) {
            console.log("Put your Smartphone at a specific distance away from the beacon.")
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
            spinner.succeed("Measurements done")

            console.log(" ")
            console.log(" RSSI MEASUREMENTS: (" + this.rssiMeasurements.length + ")")
            console.log(" Min: " + this.rssiMin + "  Max: "+ this.rssiMax + "  Avg: " + this.getAvg() +"  Median: " + this.median(this.rssiMeasurements))
            console.log(" ")

            const txPower = this.getAvg();

            // Resetting:
            this.rssiMin = 0
            this.rssiMax = 0
            this.rssiMeasurements = []
            this.kalman = getDefaultKalmanFilter()
        }



    }

    private median(arr: number[]) {
        const arrSort = arr.sort();
        const mid = Math.ceil(arr.length / 2);

        const median =
            arr.length % 2 == 0 ? (arrSort[mid] + arrSort[mid - 1]) / 2 : arrSort[mid - 1];
        return median
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

        console.log(peripheral.advertisement.txPowerLevel)
        const rssi = this.kalman.filter(peripheral.rssi)
        this.rssiMeasurements.push(rssi)
        if (rssi > this.rssiMax || this.rssiMax == 0) {
            this.rssiMax = rssi
        }
        if (rssi < this.rssiMin || this.rssiMin == 0) {
            this.rssiMin = rssi;
        }

    }
}