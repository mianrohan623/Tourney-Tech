"use client";
import { useState } from "react";

import BankDetailsForm from "@/components/ui/admin/bank-details/BankDetailsForm";
import BankDetailsTable from "@/components/ui/admin/bank-details/BankDetailsTable";

export default function AddBankDetails() {
  

  return (
    <>
      <BankDetailsForm />
      <BankDetailsTable />
    </>
  );
}
