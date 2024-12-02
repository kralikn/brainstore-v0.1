'use client'

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { createComparison } from "@/utils/actions";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Dot, GitCompareArrows, Loader2, Trash2 } from "lucide-react";
import { useState } from "react";

export default function AlteryxChatPage() {

  const queryClient = useQueryClient()
  const { toast } = useToast()

  const [firstNote, setFirstNote] = useState("");
  const [secondNote, setSecondNote] = useState("");
  const [discrepancies, setDiscrepancies] = useState([]);

  const { mutate, isPending } = useMutation({
    mutationFn: (values) => createComparison(values),
    onSuccess: (data) => {
      if (data?.error) {
        toast({
          variant: "destructive",
          description: data.error,
        });
        return;
      }
      if (data?.response) {
        let responseData = data.response;

        if (typeof responseData === 'string') {
          try {
            const parsedResponse = JSON.parse(responseData);
            setDiscrepancies(parsedResponse);
            toast({ description: "Az összehasonlítás elkészült." })
          } catch (error) {
            setDiscrepancies("Rossz formátum")
            toast({ description: "Az összehasonlítás elkészült. Rossz formátum (string)." })
          }
        } else if (Array.isArray(responseData)) {
          setDiscrepancies(responseData);
          toast({ description: "Az összehasonlítás elkészült." });
        } else {
          setDiscrepancies("Rossz formátum");
          toast({ description: "Az összehasonlítás elkészült. Rossz formátum." })
        }
      }
    }
  })

  const onSubmit = () => {
    mutate({ firstNote, secondNote })
  }

  const deleteMessages = () => {
    setFirstNote("")
    setSecondNote("")
    setDiscrepancies([])
  }

  return (
    <div className="flex flex-col gap-4">
      <Card className="flex justify-between items-center bg-slate-100 border-none p-4">
        <CardHeader className="p-0">
          <CardTitle>
            Eltérések keresése
          </CardTitle>
        </CardHeader>
      </Card>

      <div className='grid grid-cols-12 gap-6'>
        <div className='col-span-6'>
          <Label htmlFor="first-note" className='pl-3'>Első jegyzet</Label>
          <Textarea
            value={firstNote}
            onChange={e => setFirstNote(e.target.value)}
            id="first-note"
            rows={15}
          />
        </div>
        <div className='col-span-6'>
          <Label htmlFor="second-note" className='pl-3'>Második jegyzet</Label>
          <Textarea
            value={secondNote}
            onChange={e => setSecondNote(e.target.value)}
            id="second-note"
            rows={15}
          />
        </div>
      </div>
      <div className="space-x-4">
        <Button
          onClick={onSubmit}
          disabled={!firstNote || !secondNote || isPending}
        >
          {isPending ? <Loader2 className="animate-spin" /> : <GitCompareArrows />}Összehasonlítás
        </Button>
        <Button
          onClick={deleteMessages}
          disabled={!firstNote && !secondNote || isPending}
        >
          <Trash2 />Törlés
        </Button>
      </div>
      {discrepancies && <div className="mt-4">
        <Card className="">
          <CardHeader className="">
            <CardTitle className="text-xl">
              Összehasonlítás eredménye:
            </CardTitle>
            <CardDescription>{Array.isArray(discrepancies) && `${discrepancies.length} különbség`}</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-2">
            {isPending && <div className="space-y-2">
              <Skeleton className="h-4 w-[450px] bg-slate-100 rounded-md" />
              <Skeleton className="h-4 w-[550px] bg-slate-100 rounded-md" />
              <Skeleton className="h-4 w-[550px] bg-slate-100 rounded-md" />
              <Skeleton className="h-4 w-[500px] bg-slate-100 rounded-md" />
            </div>}
            {Array.isArray(discrepancies) && discrepancies.map((discrepancy, index) => {
              return (
                <div key={index} className="flex items-center gap-2">
                  <Dot />
                  <p className="text-sm">{discrepancy}</p>
                </div>
              )
            })}
            {!Array.isArray(discrepancies) && <Badge variant="destructive" className="max-w-fit px-4 py-1">Rossz formátumú válasz</Badge>}
          </CardContent>
        </Card>
      </div>}
    </div >
  )
}
