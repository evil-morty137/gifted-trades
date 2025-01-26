import { Schema, model } from 'mongoose';

export interface IWallet {
  name: string;
  address: string;
  barcode: string;
}
const walletSchema = new Schema<IWallet>({
  name: { type: String },
  address: { type: String },
  barcode: { type: String }
})

const Wallet = model<IWallet>('Wallet', walletSchema);
export default Wallet 