#!/usr/bin/env node

import CommandManager from "./modules/CommandManager";
import HelloWorld from "./modules/helloWorld";
import BluetoothModule from "./modules/BluetoothModule";
import CollectRSSIs from "./modules/CollectRSSis";

new CommandManager()
    .registerCommand(new HelloWorld())
    .registerCommandExperimental(new BluetoothModule("ble", "Fancy Bluetooth LE stuff"))
    .registerCommandExperimental(new CollectRSSIs("rssi", "Fancy Bluetooth LE stuff"))
    .build()
