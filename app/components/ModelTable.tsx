import React from 'react'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { AIModelMode } from '../types'
import { aiModels } from '../utils/aiModels'
import { calculateCost } from '../utils/helpers'
import { ArrowUpDown } from 'lucide-react'

interface ModelTableProps {
  selectedMode: AIModelMode
  setSelectedMode: (mode: AIModelMode) => void
  searchTerm: string
  showPricingCalculator: boolean
  inputAmount: number
  outputAmount: number
  apiCalls: number
}

const ModelTable: React.FC<ModelTableProps> = ({
  selectedMode,
  setSelectedMode,
  searchTerm,
  showPricingCalculator,
  inputAmount,
  outputAmount,
  apiCalls
}) => {
  const [sortConfig, setSortConfig] = React.useState<{ key: string | null, direction: 'ascending' | 'descending' }>({ key: null, direction: 'ascending' })

  const filteredModels = React.useMemo(() => {
    return aiModels[selectedMode]?.filter(model => 
      model.name.toLowerCase().includes(searchTerm.toLowerCase())
    ) || []
  }, [selectedMode, searchTerm])

  const sortedModels = React.useMemo(() => {
    let sortableModels = [...filteredModels]
    if (sortConfig.key !== null) {
      sortableModels.sort((a, b) => {
        if (a.sample_spec[sortConfig.key!] < b.sample_spec[sortConfig.key!]) {
          return sortConfig.direction === 'ascending' ? -1 : 1
        }
        if (a.sample_spec[sortConfig.key!] > b.sample_spec[sortConfig.key!]) {
          return sortConfig.direction === 'ascending' ? 1 : -1
        }
        return 0
      })
    }
    return sortableModels
  }, [filteredModels, sortConfig])

  const requestSort = (key: string) => {
    let direction: 'ascending' | 'descending' = 'ascending'
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending'
    }
    setSortConfig({ key, direction })
  }

  return (
    <div className="mb-8">
      <div className="flex justify-start space-x-2 mb-6 overflow-x-auto">
        {Object.keys(aiModels).map((mode) => (
          <Button
            key={mode}
            variant={selectedMode === mode ? "default" : "outline"}
            onClick={() => setSelectedMode(mode as AIModelMode)}
            className={`border-black ${selectedMode === mode ? 'bg-black text-white' : 'text-black hover:bg-gray-100'}`}
          >
            {mode === 'audio_speech' ? 'TTS (Text To Speech)' : mode.charAt(0).toUpperCase() + mode.slice(1).replace('_', ' ')}
          </Button>
        ))}
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[180px]">Model</TableHead>
            <TableHead>Provider</TableHead>
            <TableHead onClick={() => requestSort('max_tokens')} className="cursor-pointer">
              Context Length <ArrowUpDown className="inline-block ml-1 h-4 w-4" />
            </TableHead>
            <TableHead onClick={() => requestSort('max_output_tokens')} className="cursor-pointer">
              Output Length <ArrowUpDown className="inline-block ml-1 h-4 w-4" />
            </TableHead>
            <TableHead onClick={() => requestSort('input_cost_per_token')} className="cursor-pointer">
              Input Price (per 1M tokens) <ArrowUpDown className="inline-block ml-1 h-4 w-4" />
            </TableHead>
            <TableHead onClick={() => requestSort('output_cost_per_token')} className="cursor-pointer">
              Output Price (per 1M tokens) <ArrowUpDown className="inline-block ml-1 h-4 w-4" />
            </TableHead>
            <TableHead>Total Cost</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedModels.map((model) => (
            <TableRow key={model.name}>
              <TableCell className="font-medium">{model.name}</TableCell>
              <TableCell>
                <div className="flex items-center space-x-2">
                  <img src={model.logo} alt={`${model.provider} logo`} className="w-6 h-6" />
                  <span>{model.provider}</span>
                </div>
              </TableCell>
              <TableCell>
  {model.sample_spec.input_cost_per_token !== null && model.sample_spec.input_cost_per_token !== undefined
    ? (model.sample_spec.input_cost_per_token * 1000000).toFixed(2)
    : 'N/A'}
</TableCell>
<TableCell>
  {model.sample_spec.output_cost_per_token !== null && model.sample_spec.output_cost_per_token !== undefined
    ? (model.sample_spec.output_cost_per_token * 1000000).toFixed(2)
    : 'N/A'}
</TableCell>
<TableCell className="font-bold">
  {model.sample_spec.input_cost_per_token && model.sample_spec.output_cost_per_token
    ? ((model.sample_spec.input_cost_per_token + model.sample_spec.output_cost_per_token) * 1000000).toFixed(2)
    : 'N/A'}
</TableCell>
              <TableCell className="font-bold">
                {model.sample_spec.input_cost_per_token && model.sample_spec.output_cost_per_token ? (
                  showPricingCalculator ? (
                    `$${calculateCost(
                      model,
                      inputAmount,
                      outputAmount,
                      apiCalls
                    )}`
                  ) : (
                    `$${((model.sample_spec.input_cost_per_token + model.sample_spec.output_cost_per_token) * 1000000).toFixed(2)}`
                  )
                ) : (
                  'N/A'
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}

export default ModelTable
