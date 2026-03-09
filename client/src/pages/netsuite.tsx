import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, XCircle, Loader2, Database, Play, ArrowLeft } from "lucide-react";
import { Link } from "wouter";
import { useToast } from "@/hooks/use-toast";

export default function NetSuitePage() {
  const { toast } = useToast();
  const [query, setQuery] = useState("SELECT TOP 10 id, entityid, companyname FROM customer");
  const [queryResults, setQueryResults] = useState<any[] | null>(null);

  const statusQuery = useQuery<{ configured: boolean; missing: string[] }>({
    queryKey: ["/api/netsuite/status"],
  });

  const testMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/netsuite/test");
      return res.json();
    },
    onSuccess: (data) => {
      toast({
        title: data.success ? "Connection Successful" : "Connection Failed",
        description: data.message,
        variant: data.success ? "default" : "destructive",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Connection Test Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const queryMutation = useMutation({
    mutationFn: async (suiteqlQuery: string) => {
      const res = await apiRequest("POST", "/api/netsuite/query", { query: suiteqlQuery });
      return res.json();
    },
    onSuccess: (data) => {
      if (data.success) {
        setQueryResults(data.data);
        toast({
          title: "Query Executed",
          description: `Returned ${data.totalResults} result(s)`,
        });
      } else {
        setQueryResults(null);
        toast({
          title: "Query Failed",
          description: data.error,
          variant: "destructive",
        });
      }
    },
    onError: (error: Error) => {
      setQueryResults(null);
      toast({
        title: "Query Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const isConfigured = statusQuery.data?.configured ?? false;

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center gap-4">
          <Link href="/">
            <Button variant="ghost" size="sm" data-testid="link-back-home">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900" data-testid="text-page-title">
              NetSuite Connection
            </h1>
            <p className="text-gray-500">Manage your NetSuite SuiteQL connection</p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              Configuration Status
            </CardTitle>
            <CardDescription>
              Verify that all required NetSuite credentials are configured
            </CardDescription>
          </CardHeader>
          <CardContent>
            {statusQuery.isLoading ? (
              <div className="flex items-center gap-2" data-testid="status-loading">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Checking configuration...</span>
              </div>
            ) : isConfigured ? (
              <div className="flex items-center gap-2" data-testid="status-configured">
                <CheckCircle2 className="h-5 w-5 text-green-600" />
                <span className="text-green-700 font-medium">All credentials configured</span>
              </div>
            ) : (
              <div className="space-y-2" data-testid="status-missing">
                <div className="flex items-center gap-2">
                  <XCircle className="h-5 w-5 text-red-600" />
                  <span className="text-red-700 font-medium">Missing credentials:</span>
                </div>
                <div className="flex gap-2 flex-wrap">
                  {statusQuery.data?.missing.map((key) => (
                    <Badge key={key} variant="destructive" data-testid={`badge-missing-${key}`}>
                      {key}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            <div className="mt-4">
              <Button
                onClick={() => testMutation.mutate()}
                disabled={!isConfigured || testMutation.isPending}
                data-testid="button-test-connection"
              >
                {testMutation.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <CheckCircle2 className="h-4 w-4 mr-2" />
                )}
                Test Connection
              </Button>

              {testMutation.data && (
                <div className="mt-3" data-testid="text-test-result">
                  <Badge variant={testMutation.data.success ? "default" : "destructive"}>
                    {testMutation.data.success ? "Connected" : "Failed"}
                  </Badge>
                  <p className="text-sm text-gray-600 mt-1">{testMutation.data.message}</p>
                  {testMutation.data.accountId && (
                    <p className="text-sm text-gray-500">Account: {testMutation.data.accountId}</p>
                  )}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Play className="h-5 w-5" />
              SuiteQL Query
            </CardTitle>
            <CardDescription>
              Execute SuiteQL queries against your NetSuite account to retrieve schedule data
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Textarea
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Enter your SuiteQL query..."
              className="font-mono text-sm min-h-[120px]"
              data-testid="input-suiteql-query"
            />
            <Button
              onClick={() => queryMutation.mutate(query)}
              disabled={!isConfigured || !query.trim() || queryMutation.isPending}
              data-testid="button-execute-query"
            >
              {queryMutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <Play className="h-4 w-4 mr-2" />
              )}
              Execute Query
            </Button>

            {queryResults && (
              <div className="mt-4" data-testid="container-query-results">
                <h3 className="text-sm font-medium text-gray-700 mb-2">
                  Results ({queryResults.length} rows)
                </h3>
                <div className="border rounded-lg overflow-auto max-h-[400px]">
                  {queryResults.length > 0 ? (
                    <table className="w-full text-sm">
                      <thead className="bg-gray-100 sticky top-0">
                        <tr>
                          {Object.keys(queryResults[0])
                            .filter((k) => k !== "links")
                            .map((key) => (
                              <th
                                key={key}
                                className="text-left px-3 py-2 font-medium text-gray-700 border-b"
                              >
                                {key}
                              </th>
                            ))}
                        </tr>
                      </thead>
                      <tbody>
                        {queryResults.map((row, i) => (
                          <tr key={i} className="border-b hover:bg-gray-50" data-testid={`row-result-${i}`}>
                            {Object.entries(row)
                              .filter(([k]) => k !== "links")
                              .map(([key, val]) => (
                                <td key={key} className="px-3 py-2 text-gray-600">
                                  {val !== null && val !== undefined ? String(val) : "—"}
                                </td>
                              ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  ) : (
                    <p className="p-4 text-gray-500 text-center" data-testid="text-no-results">
                      No results returned
                    </p>
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
