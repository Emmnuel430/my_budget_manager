import { Transaction } from "@/type";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React from "react";

interface TransactionItemProps {
  transaction: Transaction;
}

const TransactionItem: React.FC<TransactionItemProps> = ({ transaction }) => {
  const router = useRouter();

  const handleMobileClick = () => {
    if (window.innerWidth < 768) {
      router.push(`/manage/${transaction.budgetId}`);
    }
  };
  return (
    <li
      key={transaction.id}
      onClick={handleMobileClick}
      className="
        group
        flex flex-row md:items-center justify-between
        bg-base-200/60 hover:bg-base-300 transition-all duration-300
        p-4 rounded-xl shadow-sm hover:shadow-md cursor-pointer
      "
    >
      {/* LEFT */}
      <div className="flex items-center gap-3 max-w-2/5">
        <div>
          <div className="badge badge-accent badge-lg font-semibold">
            - {transaction.amount} €
          </div>
        </div>
      </div>

      {/* CENTER */}
      <div className="mt-1 md:mt-0 flex flex-col md:items-center text-sm text-base-content/80 text-end">
        <div>
          <span className="font-bold text-base-content/90 capitalize">
            {transaction.budgetName}
          </span>{" "}
          -{" "}
          <span className="font-medium capitalize">
            {transaction.description}
          </span>
        </div>
        <span className="text-xs md:text-base">
          {transaction.createdAt.toLocaleDateString("fr-FR")} à{" "}
          {transaction.createdAt.toLocaleTimeString("fr-FR", {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </span>
      </div>

      {/* RIGHT */}
      <div className="hidden md:flex">
        <Link href={`/manage/${transaction.budgetId}`} className="btn">
          Voir plus
        </Link>
      </div>
    </li>
  );
};

export default TransactionItem;
