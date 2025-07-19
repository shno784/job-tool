import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
} from "@/components/ui/card";

export default function HomePage() {
  return (
    <div className="flex flex-col">
      {/* Hero */}
      <section className="flex flex-col items-center text-center bg-gradient-to-b from-gray-900 to-gray-800 py-24 px-6">
        <h1 className="max-w-2xl text-5xl font-bold leading-tight text-white">
          AI-Powered Job Application Toolkit
        </h1>
        <p className="mt-4 max-w-xl text-lg text-gray-300">
          Tailor your resume, auto-generate cover letters, and track every
          application—all in one place.
        </p>
        <div className="mt-8 flex space-x-4">
          <Button size="lg" className="cursor-pointer">
            Get Started
          </Button>
          <Button variant="outline" size="lg" className="cursor-pointer">
            Learn More
          </Button>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 bg-background">
        <div className="max-w-4xl mx-auto grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle>Resume Analyzer</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Upload your resume to extract skills, experiences, and optimize
                formatting.
              </CardDescription>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Resume Tailor</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Paste a job description along with your resume and get back a
                version that’s custom-crafted to highlight exactly what that
                employer wants.
              </CardDescription>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Cover Letter Generator</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Auto-generate personalized cover letters in seconds using AI.
              </CardDescription>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
}
