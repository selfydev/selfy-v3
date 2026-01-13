'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/badge';
import { Toggle } from '@/components/ui/toggle';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Settings, Activity, CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { format } from 'date-fns';

interface AutomationRule {
  id: string;
  name: string;
  description: string;
  trigger: string;
  isActive: boolean;
  createdAt: string;
  _count: {
    logs: number;
  };
}

interface AutomationLog {
  id: string;
  success: boolean;
  message: string;
  createdAt: string;
  rule: {
    name: string;
    trigger: string;
  };
}

export default function AutomationsPage() {
  const [rules, setRules] = useState<AutomationRule[]>([]);
  const [logs, setLogs] = useState<AutomationLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isToggling, setIsToggling] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    setIsLoading(true);
    try {
      const [rulesRes, logsRes] = await Promise.all([
        fetch('/api/admin/automation-rules'),
        fetch('/api/admin/automation-logs'),
      ]);

      if (rulesRes.ok) {
        const rulesData = await rulesRes.json();
        setRules(rulesData);
      }

      if (logsRes.ok) {
        const logsData = await logsRes.json();
        setLogs(logsData);
      }
    } catch (error) {
      console.error('Error fetching automation data:', error);
    } finally {
      setIsLoading(false);
    }
  }

  async function toggleRule(ruleId: string, currentState: boolean) {
    setIsToggling(ruleId);
    try {
      const res = await fetch(`/api/admin/automation-rules/${ruleId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !currentState }),
      });

      if (res.ok) {
        // Update local state
        setRules(rules.map(r => r.id === ruleId ? { ...r, isActive: !currentState } : r));
      }
    } catch (error) {
      console.error('Error toggling rule:', error);
    } finally {
      setIsToggling(null);
    }
  }

  const activeRulesCount = rules.filter(r => r.isActive).length;
  const totalExecutions = logs.length;
  const successfulExecutions = logs.filter(l => l.success).length;
  const successRate = totalExecutions > 0 ? ((successfulExecutions / totalExecutions) * 100).toFixed(1) : '0';

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Automation Rules</h1>
        <p className="text-muted-foreground">
          Configure and monitor automated workflows for bookings and templates
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Rules</CardTitle>
            <Settings className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeRulesCount} / {rules.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Executions</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalExecutions}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{successRate}%</div>
            <p className="text-xs text-muted-foreground">
              {successfulExecutions} successful
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Failed</CardTitle>
            <XCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalExecutions - successfulExecutions}</div>
            <p className="text-xs text-muted-foreground">
              Requires attention
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="rules">
        <TabsList>
          <TabsTrigger value="rules">
            <Settings className="mr-2 h-4 w-4" />
            Rules
          </TabsTrigger>
          <TabsTrigger value="logs">
            <Activity className="mr-2 h-4 w-4" />
            Execution Logs
          </TabsTrigger>
        </TabsList>

        <TabsContent value="rules" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Automation Rules</CardTitle>
              <CardDescription>
                Manage automated workflows and event-driven actions
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
              ) : rules.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No automation rules found. Run <code className="bg-muted px-2 py-1 rounded">npm run seed:automations</code> to create default rules.
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Trigger</TableHead>
                      <TableHead>Executions</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {rules.map((rule) => (
                      <TableRow key={rule.id}>
                        <TableCell>
                          <div>
                            <div className="font-medium">{rule.name}</div>
                            <div className="text-sm text-muted-foreground">{rule.description}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{rule.trigger}</Badge>
                        </TableCell>
                        <TableCell>
                          <span className="text-sm">{rule._count.logs}</span>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <Toggle
                              pressed={rule.isActive}
                              onPressedChange={() => toggleRule(rule.id, rule.isActive)}
                              disabled={isToggling === rule.id}
                              aria-label="Toggle automation rule"
                            >
                              {rule.isActive ? 'ON' : 'OFF'}
                            </Toggle>
                            {isToggling === rule.id && (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <Badge variant={rule.isActive ? "default" : "secondary"}>
                            {rule.isActive ? 'Active' : 'Inactive'}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="logs" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent Executions</CardTitle>
              <CardDescription>Last 50 automation executions</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
              ) : logs.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No execution logs found. Automations will be logged here when they run.
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Status</TableHead>
                      <TableHead>Rule</TableHead>
                      <TableHead>Message</TableHead>
                      <TableHead>Executed At</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {logs.map((log) => (
                      <TableRow key={log.id}>
                        <TableCell>
                          {log.success ? (
                            <CheckCircle className="h-5 w-5 text-green-500" />
                          ) : (
                            <XCircle className="h-5 w-5 text-red-500" />
                          )}
                        </TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium">{log.rule.name}</div>
                            <div className="text-sm text-muted-foreground">{log.rule.trigger}</div>
                          </div>
                        </TableCell>
                        <TableCell className="max-w-md">
                          <span className="text-sm">{log.message}</span>
                        </TableCell>
                        <TableCell>
                          <span className="text-sm text-muted-foreground">
                            {format(new Date(log.createdAt), 'PPp')}
                          </span>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
