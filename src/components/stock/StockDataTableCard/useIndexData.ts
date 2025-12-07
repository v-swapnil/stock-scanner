import { useEffect, useState } from "react";
import axios from "axios";
import { toFixedIntegerNumber } from "@/lib/common";
import {
  TIndexMetric,
  TIndexDataContributorItem,
  TConsolidatedContributors,
} from "@/lib/types";

export function useIndexData() {
  const [niftyMetrics, setNiftyMetrics] = useState<TIndexMetric>({});
  const [niftyBankMetrics, setNiftyBankMetrics] = useState<TIndexMetric>({});

  useEffect(() => {
    const fetchIndexData = async () => {
      // Nifty Contributions
      const getNiftyContributions = async () => {
        const response = await axios.get("/api/contributors-v2?indexId=nifty");
        const responseJson: Array<TIndexDataContributorItem> = response.data;

        const pointChanged = responseJson.reduce(
          (prev, item) => prev + item.pointchange,
          0,
        );
        const niftyNegative = responseJson.filter(
          (item) => item.pointchange < 0,
        ).length;
        const niftyPositive = 50 - niftyNegative;

        const positiveContributors = responseJson
          .filter((item) => item.pointchange > 0)
          .sort((a, b) => b.pointchange - a.pointchange)
          .slice(0, 4);
        const negativeContributors = responseJson
          .filter((item) => item.pointchange < 0)
          .sort((a, b) => a.pointchange - b.pointchange)
          .slice(0, 4);

        let contributors: TConsolidatedContributors = [];
        if (positiveContributors.length >= negativeContributors.length) {
          contributors = positiveContributors.map((item, index) => ({
            positiveSymbol: item.symbol,
            positivePointChanged: item.pointchange,
            negativeSymbol: negativeContributors[index]?.symbol,
            negativePointChanged: negativeContributors[index]?.pointchange,
          }));
        } else {
          contributors = negativeContributors.map((item, index) => ({
            positiveSymbol: positiveContributors[index]?.symbol,
            positivePointChanged: positiveContributors[index]?.pointchange,
            negativeSymbol: item.symbol,
            negativePointChanged: item.pointchange,
          }));
        }

        setNiftyMetrics((prev) => ({
          ...prev,
          pointChanged: parseFloat(pointChanged?.toFixed(2)),
          advanceDecline: toFixedIntegerNumber((niftyPositive / 50) * 100),
          contributors: contributors,
        }));
      };

      // Bank Nifty Contributions
      const getBankNiftyContributions = async () => {
        const response = await axios.get(
          "/api/contributors-v2?indexId=niftyBank",
        );
        const responseJson: Array<TIndexDataContributorItem> = response.data;

        const pointChanged = responseJson.reduce(
          (prev, item) => prev + item.pointchange,
          0,
        );
        const bankNiftyNegative = responseJson.filter(
          (item) => item.pointchange < 0,
        ).length;
        const bankNiftyPositive = responseJson.length - bankNiftyNegative;

        const positiveContributors = responseJson
          .filter((item) => item.pointchange > 0)
          .sort((a, b) => b.pointchange - a.pointchange)
          .slice(0, 4);
        const negativeContributors = responseJson
          .filter((item) => item.pointchange < 0)
          .sort((a, b) => a.pointchange - b.pointchange)
          .slice(0, 4);

        let contributors: TConsolidatedContributors = [];
        if (positiveContributors.length >= negativeContributors.length) {
          contributors = positiveContributors.map((item, index) => ({
            positiveSymbol: item.symbol,
            positivePointChanged: item.pointchange,
            negativeSymbol: negativeContributors[index]?.symbol,
            negativePointChanged: negativeContributors[index]?.pointchange,
          }));
        } else {
          contributors = negativeContributors.map((item, index) => ({
            positiveSymbol: positiveContributors[index]?.symbol,
            positivePointChanged: positiveContributors[index]?.pointchange,
            negativeSymbol: item.symbol,
            negativePointChanged: item.pointchange,
          }));
        }

        setNiftyBankMetrics((prev) => ({
          ...prev,
          pointChanged: parseFloat(pointChanged?.toFixed(2)),
          advanceDecline: toFixedIntegerNumber(
            (bankNiftyPositive / responseJson.length) * 100,
          ),
          contributors: contributors,
        }));
      };

      // Index Pricing Data
      const getIndexPricingData = async () => {
        const response = await axios.get("/api/indices");
        const responseJson: Array<any> = response.data || [];
        const niftyIndexData = responseJson.find(
          (item) => item.indexName === "NIFTY 50",
        );
        const niftyBankIndexData = responseJson.find(
          (item) => item.indexName === "NIFTY BANK",
        );
        setNiftyMetrics((prev) => ({
          ...prev,
          price: niftyIndexData?.last,
        }));
        setNiftyBankMetrics((prev) => ({
          ...prev,
          price: niftyBankIndexData?.last,
        }));
      };

      await Promise.all([
        getNiftyContributions(),
        getBankNiftyContributions(),
        getIndexPricingData(),
      ]);
    };

    fetchIndexData();
  }, []);

  return { niftyMetrics, niftyBankMetrics };
}
