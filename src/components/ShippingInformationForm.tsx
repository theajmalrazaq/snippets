import React, { useReducer, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useToast } from "@/hooks/use-toast"
import { useAxios } from "@/hooks/use-axios"
import { useQuery, useMutation, useQueryClient } from "react-query"
import { Loader2 } from "lucide-react"
import { sentenceCase } from "change-case"

type ShippingInfo = {
  fullName: string
  address: string
  city: string
  state: string
  zipCode: string
  country: string
}

type Action =
  | { type: "SET_FIELD"; field: keyof ShippingInfo; value: string }
  | { type: "SET_ALL"; payload: ShippingInfo }

const initialState: ShippingInfo = {
  fullName: "",
  address: "",
  zipCode: "",
  country: "",
  city: "",
  state: "",
}

const shippingPlaceholders: ShippingInfo = {
  fullName: "Enter your full name",
  address: "Enter your street address",
  zipCode: "Enter your zip code",
  country: "Enter your country",
  city: "Enter your city",
  state: "Enter your state",
}

const ShippingInformationForm: React.FC = () => {
  const [form, setField] = useReducer(
    (state: ShippingInfo, action: Action): ShippingInfo => {
      switch (action.type) {
        case "SET_FIELD":
          return { ...state, [action.field]: action.value }
        case "SET_ALL":
          return action.payload
        default:
          return state
      }
    },
    initialState,
  )
  const { toast } = useToast()
  const axios = useAxios()
  const queryClient = useQueryClient()

  const { data: account, isLoading: isLoadingAccount } = useQuery(
    "account",
    async () => {
      const response = await axios.get("/accounts/get")
      return response.data.account
    },
  )

  const updateShippingMutation = useMutation(
    (shippingInfo: ShippingInfo) =>
      axios.post("/accounts/update", { shippingInfo }),
    {
      onSuccess: () => {
        queryClient.invalidateQueries("account")
        toast({
          title: "Success",
          description: "Shipping information updated successfully",
        })
      },
      onError: () => {
        toast({
          title: "Error",
          description: "Failed to update shipping information",
          variant: "destructive",
        })
      },
    },
  )

  useEffect(() => {
    if (account?.shippingInfo) {
      setField({ type: "SET_ALL", payload: account.shippingInfo })
    }
  }, [account])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    updateShippingMutation.mutate(form)
  }

  if (isLoadingAccount) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    )
  }

  const fieldOrder: (keyof ShippingInfo)[] = [
    "fullName",
    "address",
    "zipCode",
    "country",
    "city",
    "state",
  ]

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {fieldOrder.map((key) => (
        <div key={key}>
          <label
            htmlFor={key}
            className="block text-sm font-medium text-gray-700"
          >
            {sentenceCase(key)}
          </label>
          <Input
            id={key}
            value={form[key]}
            onChange={(e) =>
              setField({
                type: "SET_FIELD",
                field: key,
                value: e.target.value,
              })
            }
            placeholder={shippingPlaceholders[key]}
            disabled={updateShippingMutation.isLoading}
          />
        </div>
      ))}
      <Button type="submit" disabled={updateShippingMutation.isLoading}>
        {updateShippingMutation.isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Updating...
          </>
        ) : (
          "Update"
        )}
      </Button>
    </form>
  )
}

export default ShippingInformationForm
