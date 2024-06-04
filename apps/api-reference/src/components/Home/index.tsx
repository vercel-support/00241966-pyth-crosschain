import Link from "next/link";

import { Button } from "../Button";

export const Home = () => (
  <main className="grid size-full place-content-center py-16 text-center">
    <h1 className="mb-24 text-6xl font-semibold text-pythpurple-600 dark:text-pythpurple-400">
      Pyth Network API Reference
    </h1>
    <nav
      className="flex flex-col items-stretch justify-center gap-12"
      aria-label="Products"
    >
      <ul className="contents">
        <li className="contents">
          <ProductLink href="/price-feeds" name="Price Feeds">
            Fetch real-time low-latency market data, on 50+ chains or off chain
          </ProductLink>
        </li>
        <li className="contents">
          <ProductLink href="/benchmarks" name="Benchmarks">
            Get historical market data from any Pyth feed for use in both on-
            and off-chain applications
          </ProductLink>
        </li>
        <li className="contents">
          <ProductLink href="/entropy" name="Entropy">
            Quickly and easily generate secure random numbers on the blockchain
          </ProductLink>
        </li>
      </ul>
    </nav>
  </main>
);

type ProductLinkProps = {
  name: string;
  href: string;
  children: string;
};

const ProductLink = ({ name, children, href }: ProductLinkProps) => (
  <Button
    as={Link}
    href={href}
    className="flex flex-row items-center gap-6 p-6 text-left"
  >
    <div className="aspect-square h-24 rounded-md bg-pythpurple-400/50" />
    <div className="flex flex-col gap-2">
      <h2 className="text-2xl font-medium text-pythpurple-600 dark:text-pythpurple-400">
        {name}
      </h2>
      <p className="text-sm font-normal text-neutral-600 dark:text-neutral-400">
        {children}
      </p>
    </div>
  </Button>
);
