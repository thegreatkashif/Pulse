import { Link } from 'react-router-dom'
import { Laptop2, Router } from 'lucide-react'
import { Card, CardContent } from '../ui/card'
import { Badge } from '../ui/badge'
import type { NetworkDevice } from '../../api/types'

export default function DeviceCard({ device, isGateway }: { device: NetworkDevice; isGateway: boolean }) {
  const Icon = isGateway ? Router : Laptop2

  return (
    <Link to={`/devices/${device.ip}`}>
      <Card className="border-border bg-surface transition-colors hover:bg-surface-hover">
        <CardContent className="flex items-start gap-3 pt-6">
          <div className={`rounded-md p-2 ${isGateway ? 'bg-cyan/10 text-cyan' : 'bg-electric/10 text-electric'}`}>
            <Icon size={20} />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center justify-between gap-2">
              <p className="truncate text-sm font-medium">{device.hostname ?? device.ip}</p>
              <Badge variant="outline" className={device.online ? 'border-emerald text-emerald' : 'border-muted-foreground text-muted-foreground'}>
                {device.online ? 'Online' : 'Offline'}
              </Badge>
            </div>
            <p className="mt-1 text-xs text-muted-foreground">{device.ip}</p>
            <p className="text-xs text-muted-foreground">{device.mac}</p>
            {isGateway && (
              <Badge variant="outline" className="mt-2 border-cyan text-cyan">
                Gateway
              </Badge>
            )}
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}