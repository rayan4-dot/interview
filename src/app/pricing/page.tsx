
import PageHeader from '@/components/page-header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Check } from 'lucide-react';
import Link from 'next/link';

const plans = [
    {
        name: 'Free',
        price: '$0',
        period: '/ month',
        description: 'For individuals getting started with interview prep.',
        features: [
            '5 AI mock interview sessions',
            'Basic resume and cover letter analysis',
            'Limited question bank',
            'Standard feedback',
        ],
        cta: 'Get Started',
        href: '/',
        variant: 'secondary' as const,
    },
    {
        name: 'Pro',
        price: '$19',
        period: '/ month',
        description: 'For serious job seekers who want to master their interviews.',
        features: [
            'Unlimited AI mock interview sessions',
            'Advanced resume and cover letter analysis',
            'Full industry-specific question bank',
            'Video and Voice analysis',
            'Multilingual and accent coaching',
            'Personalized career coaching dashboard',
        ],
        cta: 'Upgrade to Pro',
        href: '#',
        variant: 'default' as const,
    },
    {
        name: 'Enterprise',
        price: 'Contact Us',
        period: '',
        description: 'For teams and universities to manage candidates at scale.',
        features: [
            'All Pro features',
            'Hiring manager dashboard',
            'Create custom interviews',
            'Invite and track candidates',
            'Team analytics and reporting',
            'Priority support',
        ],
        cta: 'Contact Sales',
        href: '#',
        variant: 'outline' as const,
    },
];


export default function PricingPage() {
    return (
        <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6">
            <PageHeader
                title="Choose Your Plan"
                description="Unlock your full potential with the right plan for your needs."
            />
            <div className="grid grid-cols-1 gap-8 pt-8 md:grid-cols-2 lg:grid-cols-3">
                {plans.map((plan) => (
                    <Card key={plan.name} className={`flex flex-col ${plan.name === 'Pro' ? 'border-primary shadow-lg' : ''}`}>
                        <CardHeader>
                            <CardTitle>{plan.name}</CardTitle>
                            <CardDescription>{plan.description}</CardDescription>
                            <div className="flex items-baseline pt-4">
                                <span className="text-4xl font-bold">{plan.price}</span>
                                {plan.period && <span className="ml-1 text-muted-foreground">{plan.period}</span>}
                            </div>
                        </CardHeader>
                        <CardContent className="flex-1">
                            <ul className="space-y-4">
                                {plan.features.map((feature) => (
                                    <li key={feature} className="flex items-start">
                                        <Check className="mr-2 mt-1 h-5 w-5 shrink-0 text-primary" />
                                        <span>{feature}</span>
                                    </li>
                                ))}
                            </ul>
                        </CardContent>
                        <CardFooter>
                            <Button asChild className="w-full" variant={plan.variant}>
                                <Link href={plan.href}>{plan.cta}</Link>
                            </Button>
                        </CardFooter>
                    </Card>
                ))}
            </div>
        </main>
    );
}
