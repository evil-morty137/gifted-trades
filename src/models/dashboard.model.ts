import { Schema, model, Types } from "mongoose";

export interface IDashboard {
  userId: Types.ObjectId;
  deposit: Types.Decimal128;
  profit: Types.Decimal128;
  netProfit: Types.Decimal128;
  todaysProfit: Types.Decimal128;
  package: string;
  createdAt: Date;
}

const DashboardSchema = new Schema<IDashboard>({
  userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  deposit: { type: Schema.Types.Decimal128, default: 0 },
  profit: { type: Schema.Types.Decimal128, default: 0 },
  netProfit: { type: Schema.Types.Decimal128, default: 0 },
  todaysProfit: { type: Schema.Types.Decimal128, default: 0 },
  package: { type: String, default: "InActive" },
  createdAt: { type: Date, default: Date.now }
});

const Dashboard = model<IDashboard>("Dashboard", DashboardSchema);
export default Dashboard;
