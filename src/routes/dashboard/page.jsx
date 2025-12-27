import React from "react";
import TopCard from "../../components/TopCard";
import AnalyticsDashboard from "../../components/Analytics";

function Page() {
    return (
        <div className="space-y-10 p-6">
            <TopCard />

            <AnalyticsDashboard />
        </div>
    );
}

export default Page;
