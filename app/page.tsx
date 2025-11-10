import Navbar from "./components/Navbar";
import AuthButtons from "./components/AuthButtons";
import budgets from "./data";
import BudgetItem from "./components/BudgetItem";
import Link from "next/link";

export default function Home() {
  return (
    <div>
      {/* <button className="btn btn-accent">Test</button> */}
      <Navbar />
      <div className="flex items-center justify-center flex-col py-10 w-full">
        <div>
          <div className="flex flex-col">
            <div className="max-w-md mx-auto">
              <h1 className="text-4xl md:text-5xl font-bold text-center">
                Prenez le <span className="text-accent">contrôle</span> de vos{" "}
                <span className="text-accent">finances</span>
              </h1>
            </div>
            <p className="py-6 text-gray-800 text-center">
              Suivez vos budgets et vos dépenses <br /> en toute simplicité avec
              notre application intuitive !
            </p>
            <AuthButtons />

            <ul className="grid md:grid-cols-3 mt-6 gap-4 md:min-w-[1200px]">
              {budgets.map((budget) => (
                <Link href={""} key={budget.id}>
                  <BudgetItem budget={budget} enableHover={1}></BudgetItem>
                </Link>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
