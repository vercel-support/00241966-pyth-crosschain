import yargs from "yargs";
import { hideBin } from "yargs/helpers";
import { checkHex, Client } from "../index";
import { privateKeyToAccount } from "viem/accounts";
import { isHex } from "viem";
import { BidStatusUpdate, Opportunity } from "../types";

const DAY_IN_SECONDS = 60 * 60 * 24;

class SimpleSearcher {
  private client: Client;
  constructor(
    public endpoint: string,
    public chainId: string,
    public privateKey: string
  ) {
    this.client = new Client(
      { baseUrl: endpoint },
      undefined,
      this.opportunityHandler.bind(this),
      this.bidStatusHandler.bind(this)
    );
  }

  async bidStatusHandler(bidStatus: BidStatusUpdate) {
    let resultDetails = "";
    if (bidStatus.type == "submitted") {
      resultDetails = `, transaction ${bidStatus.result}, index ${bidStatus.index} of multicall`;
    } else if (bidStatus.type == "lost") {
      resultDetails = `, transaction ${bidStatus.result}`;
    }
    console.log(
      `Bid status for bid ${bidStatus.id}: ${bidStatus.type.replaceAll(
        "_",
        " "
      )}${resultDetails}`
    );
  }

  async opportunityHandler(opportunity: Opportunity) {
    const bid = BigInt(argv.bid);
    // Bid info should be generated by evaluating the opportunity
    // here for simplicity we are using a constant bid and 24 hours of validity
    const bidParams = {
      amount: bid,
      validUntil: BigInt(Math.round(Date.now() / 1000 + DAY_IN_SECONDS)),
    };
    const opportunityBid = await this.client.signOpportunityBid(
      opportunity,
      bidParams,
      checkHex(argv.privateKey)
    );
    try {
      const bidId = await this.client.submitOpportunityBid(opportunityBid);
      console.log(
        `Successful bid. Opportunity id ${opportunityBid.opportunityId} Bid id ${bidId}`
      );
    } catch (error) {
      console.error(
        `Failed to bid on opportunity ${opportunity.opportunityId}: ${error}`
      );
    }
  }

  async start() {
    try {
      await this.client.subscribeChains([argv.chainId]);
      console.log(
        `Subscribed to chain ${argv.chainId}. Waiting for opportunities...`
      );
    } catch (error) {
      console.error(error);
      this.client.websocket?.close();
    }
  }
}

const argv = yargs(hideBin(process.argv))
  .option("endpoint", {
    description:
      "Express relay endpoint. e.g: https://per-staging.dourolabs.app/",
    type: "string",
    demandOption: true,
  })
  .option("chain-id", {
    description: "Chain id to fetch opportunities for. e.g: sepolia",
    type: "string",
    demandOption: true,
  })
  .option("bid", {
    description: "Bid amount in wei",
    type: "string",
    default: "100",
  })
  .option("private-key", {
    description:
      "Private key to sign the bid with in hex format with 0x prefix. e.g: 0xdeadbeef...",
    type: "string",
    demandOption: true,
  })
  .help()
  .alias("help", "h")
  .parseSync();
async function run() {
  if (isHex(argv.privateKey)) {
    const account = privateKeyToAccount(argv.privateKey);
    console.log(`Using account: ${account.address}`);
  } else {
    throw new Error(`Invalid private key: ${argv.privateKey}`);
  }
  const searcher = new SimpleSearcher(
    argv.endpoint,
    argv.chainId,
    argv.privateKey
  );
  await searcher.start();
}

run();
