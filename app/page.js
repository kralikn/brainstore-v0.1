import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { socialAuth } from "@/utils/actions";
import { Brain } from "lucide-react";

export default function Home() {
  return (
    <div className="w-screen h-screen flex flex-col bg-slate-100">
      <div className="flex-1 flex justify-center items-center w-4/5 mx-auto">
        <Card className="flex flex-col justify-between border-none px-6 py-4 h-[calc(40%)]">
          <CardHeader className="flex flex-col gap-1 mb-8">
            <CardTitle className="flex flex-row items-center gap-1 text-5xl">
              <span>brainst</span>
              <span className="-ml-1 -mr-1.5 mb-1"><Brain size={50} className="animate-pulse" /></span>
              <span>re</span>
            </CardTitle>
            <CardDescription>dokumentum alapú tudástár</CardDescription>
          </CardHeader>
          <CardFooter>
            <Button onClick={socialAuth}>belépés Google-fiókkal</Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}
