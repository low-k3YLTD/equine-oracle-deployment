import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { trpc } from "@/lib/trpc";
import { Loader2, Upload, AlertCircle, CheckCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function CSVUpload() {
  const [csvFile, setCSVFile] = useState<File | null>(null);
  const [track, setTrack] = useState("");
  const [raceType, setRaceType] = useState("");
  const [distance, setDistance] = useState("");
  const [predictions, setPredictions] = useState<any>(null);
  const [error, setError] = useState("");

  const uploadMutation = trpc.csvUpload.uploadAndPredict.useMutation();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setCSVFile(file);
      setError("");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setPredictions(null);

    if (!csvFile || !track || !raceType || !distance) {
      setError("Please fill in all required fields");
      return;
    }

    try {
      const csvContent = await csvFile.text();
      const result = await uploadMutation.mutateAsync({
        csvContent,
        track,
        raceType,
        distance: parseFloat(distance),
      });

      setPredictions(result);
    } catch (err: any) {
      setError(err.message || "Failed to process CSV file");
    }
  };

  const downloadTemplate = () => {
    const template = `horseName,distanceNumeric,daysSinceLastRace,horseRankRollingMean,horseRankRollingStd,horseTop3RateRollingMean,horseTop3RateRollingStd,horseNameDecayForm,horsePerfAvgRollingMean,horsePerfAvgRollingStd,prevPerfIndex,trackDistAvgPos,raceClassScore
Horse A,1200,14,2.5,0.8,0.45,0.12,3.2,2.1,0.9,1.5,2.3,4.1
Horse B,1200,7,3.1,0.6,0.52,0.10,2.8,2.5,0.7,1.8,2.1,3.9
Horse C,1200,21,2.2,0.9,0.38,0.14,3.5,1.9,1.0,1.2,2.5,4.3
Horse D,1200,3,3.8,0.5,0.65,0.08,2.5,3.0,0.6,2.1,1.9,3.7`;

    const element = document.createElement("a");
    element.setAttribute("href", "data:text/csv;charset=utf-8," + encodeURIComponent(template));
    element.setAttribute("download", "horse_race_template.csv");
    element.style.display = "none";
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <Card className="shadow-lg">
          <CardHeader className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-t-lg">
            <CardTitle className="text-3xl">Bulk CSV Upload</CardTitle>
            <CardDescription className="text-blue-100">
              Upload a CSV file with multiple horses to generate batch predictions
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <Label htmlFor="csv-file">CSV File *</Label>
                <div className="flex items-center gap-4">
                  <Input
                    id="csv-file"
                    type="file"
                    accept=".csv"
                    onChange={handleFileChange}
                    required
                    className="flex-1"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={downloadTemplate}
                    className="whitespace-nowrap"
                  >
                    Download Template
                  </Button>
                </div>
                {csvFile && (
                  <p className="text-sm text-green-600 flex items-center gap-2">
                    <CheckCircle className="w-4 h-4" />
                    {csvFile.name}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="track">Track Name *</Label>
                  <Input
                    id="track"
                    value={track}
                    onChange={(e) => setTrack(e.target.value)}
                    placeholder="e.g., Matamata"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="raceType">Race Type *</Label>
                  <Input
                    id="raceType"
                    value={raceType}
                    onChange={(e) => setRaceType(e.target.value)}
                    placeholder="e.g., 3yo"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="distance">Distance (m) *</Label>
                  <Input
                    id="distance"
                    type="number"
                    value={distance}
                    onChange={(e) => setDistance(e.target.value)}
                    placeholder="e.g., 1200"
                    required
                  />
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-semibold text-blue-900 mb-2">CSV Format Requirements:</h4>
                <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
                  <li>First row must contain column headers</li>
                  <li>Required columns: horseName, distanceNumeric, daysSinceLastRace, and all rolling average features</li>
                  <li>Use comma as delimiter</li>
                  <li>Download the template above for the correct format</li>
                </ul>
              </div>

              <Button
                type="submit"
                disabled={uploadMutation.isPending || !csvFile}
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-2 rounded-lg hover:shadow-lg transition-shadow"
              >
                {uploadMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processing CSV...
                  </>
                ) : (
                  <>
                    <Upload className="mr-2 h-4 w-4" />
                    Upload and Predict
                  </>
                )}
              </Button>
            </form>

            {predictions && (
              <div className="mt-8">
                <Alert className="mb-4 bg-green-50 border-green-200">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <AlertDescription className="text-green-800">
                    Successfully processed {predictions.rowsProcessed} horses and generated {predictions.predictions.length} predictions!
                  </AlertDescription>
                </Alert>

                <h3 className="text-2xl font-bold mb-4">Top 4 Predictions</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {predictions.predictions.map((pred: any, index: number) => (
                    <Card key={index} className="border-l-4 border-l-blue-600">
                      <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm text-gray-600">Rank {pred.predictedRank}</p>
                            <p className="text-xl font-bold">{pred.horseName}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm text-gray-600">Confidence</p>
                            <p className="text-2xl font-bold text-blue-600">{pred.confidenceScore}%</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
