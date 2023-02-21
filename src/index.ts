import { config } from "dotenv";
import  Moralis from 'moralis';
import moment from "moment";

import { abi, seaPortAddress, topic } from "./constants";

config();

const fetchEvents = async (fromBlock: number, toBlock: number) => {
    try {

        const response = await Moralis.EvmApi.events.getContractEvents({
            address: seaPortAddress,
            chain: process.env.CHAIN_ID,
            abi,
            topic,
            fromBlock,
            toBlock
        });

        const data: any = response.toJSON();

        const parseData = await data?.result.map((value: any) => {
            return {
                timeStamp: value.block_timestamp,
                offerer: value.data?.offerer,
                recipient: value.data?.recipient
            }
        });

        console.log(parseData);

    } catch (e) {
        console.error(e);
    }
}

let fromBlock = 0;

Moralis.start({
    apiKey: process.env.MORALIS_API_KEY,
}).then(() => {
    setInterval(async () => {
        const blockNumber = await Moralis.EvmApi.block.getDateToBlock({
            chain: process.env.CHAIN_ID,
            date: moment().format()
        });
        if (fromBlock === 0) {
            fromBlock = blockNumber?.result.block;
        }
        console.log (`======From Block ${fromBlock} to ${blockNumber?.result.block}======`)
        await fetchEvents(fromBlock, blockNumber?.result.block);
        fromBlock = blockNumber?.result.block + 1;
    }, 13 * 1000);
});

