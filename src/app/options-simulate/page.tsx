"use client";

import {
  Card,
  Metric,
  Select,
  SelectItem,
  TextInput,
  Text,
} from "@tremor/react";
import React, { useState } from "react";

if (!Math.erf) {
  Math.erf = (x) => {
    const sign = x >= 0 ? 1 : -1;
    x = Math.abs(x);

    const a1 = 0.254829592;
    const a2 = -0.284496736;
    const a3 = 1.421413741;
    const a4 = -1.453152027;
    const a5 = 1.061405429;
    const p = 0.3275911;

    const t = 1 / (1 + p * x);
    const y =
      1 - ((((a5 * t + a4) * t + a3) * t + a2) * t + a1) * t * Math.exp(-x * x);

    return sign * y;
  };
}

const Label = ({ children, ...props }) => (
  <label
    className="text-sm leading-none text-gray-900 dark:text-gray-50"
    {...props}
  >
    {children}
  </label>
);

const OptionsSimulator = () => {
  const [optionType, setOptionType] = useState("call");
  const [strikePrice, setStrikePrice] = useState(24200);
  const [premium, setPremium] = useState(1);
  const [spotPrice, setSpotPrice] = useState(24000);
  const [riskFreeRate, setRiskFreeRate] = useState(7);
  const [volatility, setVolatility] = useState(10);
  const [timeToMaturity, setTimeToMaturity] = useState(4);

  const timeToMaturityInYears = timeToMaturity
    ? Number(timeToMaturity) / 365
    : 0;
  const impliedVolatility = volatility ? Number(volatility) / 100 : 0;
  const riskFreeRateFraction = riskFreeRate ? Number(riskFreeRate) / 100 : 0;

  console.log(
    "timeToMaturityInYears",
    timeToMaturityInYears,
    impliedVolatility,
    riskFreeRateFraction,
  );

  const calculateBlackScholes = () => {
    const d1 =
      (Math.log(spotPrice / strikePrice) +
        (riskFreeRateFraction + Math.pow(impliedVolatility, 2) / 2) *
          timeToMaturityInYears) /
      (impliedVolatility * Math.sqrt(timeToMaturityInYears));
    const d2 = d1 - impliedVolatility * Math.sqrt(timeToMaturityInYears);

    const N = (x) => {
      return (1.0 + Math.erf(x / Math.sqrt(2))) / 2.0;
    };

    if (optionType === "call") {
      return (
        spotPrice * N(d1) -
        strikePrice *
          Math.exp(-riskFreeRateFraction * timeToMaturityInYears) *
          N(d2)
      );
    } else {
      return (
        strikePrice *
          Math.exp(-riskFreeRateFraction * timeToMaturityInYears) *
          N(-d2) -
        spotPrice * N(-d1)
      );
    }
  };

  const calculateBinomial = (steps = 100) => {
    const dt = timeToMaturityInYears / steps;
    const up = Math.exp(impliedVolatility * Math.sqrt(dt));
    const down = 1 / up;
    const p = (Math.exp(riskFreeRateFraction * dt) - down) / (up - down);

    const prices = Array(steps + 1)
      .fill(0)
      .map((_, i) => spotPrice * Math.pow(up, steps - i) * Math.pow(down, i));

    const payoffs = prices.map((price) =>
      optionType === "call"
        ? Math.max(0, price - strikePrice)
        : Math.max(0, strikePrice - price),
    );

    for (let i = steps - 1; i >= 0; i--) {
      for (let j = 0; j <= i; j++) {
        payoffs[j] =
          (p * payoffs[j] + (1 - p) * payoffs[j + 1]) *
          Math.exp(-riskFreeRateFraction * dt);
      }
    }

    return payoffs[0];
  };

  const calculateMonteCarlo = (simulations = 10000) => {
    let payoffSum = 0;

    for (let i = 0; i < simulations; i++) {
      const random = Math.random();
      const z =
        Math.sqrt(-2.0 * Math.log(random)) * Math.cos(2.0 * Math.PI * random);
      const simulatedPrice =
        spotPrice *
        Math.exp(
          (riskFreeRateFraction - 0.5 * Math.pow(impliedVolatility, 2)) *
            timeToMaturityInYears +
            impliedVolatility * z * Math.sqrt(timeToMaturityInYears),
        );

      const payoff =
        optionType === "call"
          ? Math.max(0, simulatedPrice - strikePrice)
          : Math.max(0, strikePrice - simulatedPrice);

      payoffSum += payoff;
    }

    return (
      (payoffSum / simulations) *
      Math.exp(-riskFreeRateFraction * timeToMaturityInYears)
    );
  };

  return (
    <div style={{ padding: "20px", fontFamily: "Arial, sans-serif" }}>
      <h1>Options Simulator</h1>
      <div className="flex flex-wrap">
        <div className="w-1/2 p-2">
          <Label>Option Type</Label>
          <Select
            value={optionType}
            onValueChange={(newValue) => setOptionType(newValue)}
            enableClear={false}
          >
            <SelectItem value="call">Call</SelectItem>
            <SelectItem value="put">Put</SelectItem>
          </Select>
        </div>
        <div className="w-1/2 p-2">
          <Label>Strike Price</Label>
          <TextInput
            type="number"
            value={strikePrice}
            onValueChange={(newValue) => setStrikePrice(newValue)}
          />
        </div>
        <div className="w-1/2 p-2">
          <Label>Premium:</Label>
          <TextInput
            type="number"
            value={premium}
            onValueChange={(newValue) => setPremium(newValue)}
          />
        </div>
        <div className="w-1/2 p-2">
          <Label>Spot Price:</Label>
          <TextInput
            type="number"
            value={spotPrice}
            onValueChange={(newValue) => setSpotPrice(newValue)}
          />
        </div>
        <div className="w-1/2 p-2">
          <Label>Risk-Free Rate (%):</Label>
          <TextInput
            type="number"
            step="0.25"
            value={riskFreeRate}
            onValueChange={(newValue) => setRiskFreeRate(newValue)}
          />
        </div>
        <div className="w-1/2 p-2">
          <Label>Volatility (%):</Label>
          <TextInput
            type="number"
            step="0.5"
            value={volatility}
            onValueChange={(newValue) => setVolatility(newValue)}
          />
        </div>
        <div className="w-1/2 p-2">
          <Label>Time to Expiry (days):</Label>
          <TextInput
            type="number"
            step="1"
            value={timeToMaturity}
            onValueChange={(newValue) => setTimeToMaturity(newValue)}
          />
        </div>
      </div>
      <div className="flex gap-8 mt-8">
        <Card>
          <Text>Black-Scholes Price:</Text>
          <Metric>{calculateBlackScholes().toFixed(2)}</Metric>
        </Card>
        <Card>
          <Text>Binomial Price:</Text>
          <Metric>{calculateBinomial().toFixed(2)}</Metric>
        </Card>
        <Card>
          <Text>Monte Carlo Price:</Text>
          <Metric>{calculateMonteCarlo().toFixed(2)}</Metric>
        </Card>
      </div>
    </div>
  );
};

export default OptionsSimulator;
