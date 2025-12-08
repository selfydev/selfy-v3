'use client';

import { useState } from 'react';
import PageTransition from '@/components/transitions/PageTransition';
import {
  Button,
  Input,
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
  Modal,
  ModalHeader,
  ModalTitle,
  ModalBody,
  ModalFooter,
  Icon,
  useToast,
} from '@/components/ui';

export default function ComponentsDemoPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchValue, setSearchValue] = useState('');
  const [emailValue, setEmailValue] = useState('');
  const [emailError, setEmailError] = useState('');
  const { success, error, warning, info } = useToast();

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setEmailValue(value);

    if (value && !value.includes('@')) {
      setEmailError('Please enter a valid email address');
    } else {
      setEmailError('');
    }
  };

  const handleOpenModal = () => setIsModalOpen(true);
  const handleCloseModal = () => setIsModalOpen(false);

  const handleModalConfirm = () => {
    success('Action completed successfully!');
    handleCloseModal();
  };

  return (
    <PageTransition>
      <div className="min-h-screen bg-gradient-to-br from-primary-50 to-secondary-50 py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-12 text-center">
            <h1 className="mb-4 text-5xl font-bold text-neutral-900">
              UI Component Library
            </h1>
            <p className="text-xl text-neutral-600">
              Sprint 2 - Comprehensive component showcase with design tokens
            </p>
          </div>

          <div className="space-y-12">
            {/* Buttons Section */}
            <Card variant="elevated">
              <CardHeader>
                <CardTitle>Button Components</CardTitle>
                <CardDescription>
                  Various button styles and states using design tokens
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {/* Variants */}
                  <div>
                    <h4 className="mb-3 text-sm font-semibold uppercase text-neutral-500">
                      Variants
                    </h4>
                    <div className="flex flex-wrap gap-3">
                      <Button variant="primary">Primary</Button>
                      <Button variant="secondary">Secondary</Button>
                      <Button variant="outline">Outline</Button>
                      <Button variant="ghost">Ghost</Button>
                      <Button variant="danger">Danger</Button>
                    </div>
                  </div>

                  {/* Sizes */}
                  <div>
                    <h4 className="mb-3 text-sm font-semibold uppercase text-neutral-500">
                      Sizes
                    </h4>
                    <div className="flex flex-wrap items-center gap-3">
                      <Button size="sm">Small</Button>
                      <Button size="md">Medium</Button>
                      <Button size="lg">Large</Button>
                    </div>
                  </div>

                  {/* States */}
                  <div>
                    <h4 className="mb-3 text-sm font-semibold uppercase text-neutral-500">
                      States
                    </h4>
                    <div className="flex flex-wrap gap-3">
                      <Button disabled>Disabled</Button>
                      <Button isLoading>Loading</Button>
                      <Button fullWidth>Full Width</Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Inputs Section */}
            <Card variant="elevated">
              <CardHeader>
                <CardTitle>Input Components</CardTitle>
                <CardDescription>
                  Form inputs with labels, icons, and validation
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-6 md:grid-cols-2">
                  <Input
                    label="Search"
                    placeholder="Search..."
                    value={searchValue}
                    onChange={(e) => setSearchValue(e.target.value)}
                    leftIcon={<Icon name="search" />}
                    helperText="Enter keywords to search"
                  />

                  <Input
                    label="Email"
                    type="email"
                    placeholder="you@example.com"
                    value={emailValue}
                    onChange={handleEmailChange}
                    error={emailError}
                    leftIcon={<Icon name="mail" />}
                  />

                  <Input
                    label="Password"
                    type="password"
                    placeholder="••••••••"
                    leftIcon={<Icon name="lock" />}
                    helperText="Must be at least 8 characters"
                  />

                  <Input
                    label="Disabled"
                    placeholder="Cannot edit"
                    disabled
                    value="Disabled input"
                    onChange={() => {}}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Cards Section */}
            <div>
              <h2 className="mb-6 text-2xl font-bold text-neutral-900">
                Card Components
              </h2>
              <div className="grid gap-6 md:grid-cols-3">
                <Card variant="default">
                  <CardHeader>
                    <CardTitle>Default Card</CardTitle>
                    <CardDescription>
                      Standard card with border
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-neutral-600">
                      This card uses the default variant with a subtle border
                      and background.
                    </p>
                  </CardContent>
                </Card>

                <Card variant="elevated">
                  <CardHeader>
                    <CardTitle>Elevated Card</CardTitle>
                    <CardDescription>Card with shadow</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-neutral-600">
                      This card uses elevation with a shadow effect for depth.
                    </p>
                  </CardContent>
                </Card>

                <Card variant="outlined">
                  <CardHeader>
                    <CardTitle>Outlined Card</CardTitle>
                    <CardDescription>Card with thick border</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-neutral-600">
                      This card features a prominent outlined border style.
                    </p>
                  </CardContent>
                </Card>
              </div>

              <div className="mt-6">
                <Card variant="elevated" hoverable>
                  <CardHeader>
                    <CardTitle>Interactive Hoverable Card</CardTitle>
                    <CardDescription>
                      Hover over this card to see animation
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-neutral-600">
                      This card includes hover animations powered by Framer
                      Motion.
                    </p>
                  </CardContent>
                  <CardFooter>
                    <Button size="sm" variant="outline">
                      Learn More
                    </Button>
                    <Button size="sm">Get Started</Button>
                  </CardFooter>
                </Card>
              </div>
            </div>

            {/* Modal Section */}
            <Card variant="elevated">
              <CardHeader>
                <CardTitle>Modal Component</CardTitle>
                <CardDescription>
                  Accessible modal dialogs with animations
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex gap-3">
                  <Button onClick={handleOpenModal}>Open Modal</Button>
                  <Button
                    variant="outline"
                    onClick={() => setIsModalOpen(true)}
                  >
                    Open Another
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Toast Section */}
            <Card variant="elevated">
              <CardHeader>
                <CardTitle>Toast Notifications</CardTitle>
                <CardDescription>
                  Contextual notifications with auto-dismiss
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-3">
                  <Button
                    variant="primary"
                    onClick={() =>
                      success('Operation completed successfully!')
                    }
                  >
                    Success Toast
                  </Button>
                  <Button
                    variant="danger"
                    onClick={() =>
                      error('An error occurred. Please try again.')
                    }
                  >
                    Error Toast
                  </Button>
                  <Button
                    variant="secondary"
                    onClick={() => warning('Warning: Action requires attention')}
                  >
                    Warning Toast
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => info('Information: New update available')}
                  >
                    Info Toast
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Icons Section */}
            <Card variant="elevated">
              <CardHeader>
                <CardTitle>Icon Components</CardTitle>
                <CardDescription>
                  Comprehensive icon library with multiple sizes
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {/* Sizes */}
                  <div>
                    <h4 className="mb-3 text-sm font-semibold uppercase text-neutral-500">
                      Sizes
                    </h4>
                    <div className="flex items-center gap-4">
                      <Icon name="heart" size="xs" />
                      <Icon name="heart" size="sm" />
                      <Icon name="heart" size="md" />
                      <Icon name="heart" size="lg" />
                      <Icon name="heart" size="xl" />
                    </div>
                  </div>

                  {/* Common Icons */}
                  <div>
                    <h4 className="mb-3 text-sm font-semibold uppercase text-neutral-500">
                      Common Icons
                    </h4>
                    <div className="grid grid-cols-8 gap-4">
                      <div className="flex flex-col items-center gap-2">
                        <Icon name="home" className="text-primary-600" />
                        <span className="text-xs text-neutral-600">home</span>
                      </div>
                      <div className="flex flex-col items-center gap-2">
                        <Icon name="user" className="text-primary-600" />
                        <span className="text-xs text-neutral-600">user</span>
                      </div>
                      <div className="flex flex-col items-center gap-2">
                        <Icon name="settings" className="text-primary-600" />
                        <span className="text-xs text-neutral-600">
                          settings
                        </span>
                      </div>
                      <div className="flex flex-col items-center gap-2">
                        <Icon name="search" className="text-primary-600" />
                        <span className="text-xs text-neutral-600">search</span>
                      </div>
                      <div className="flex flex-col items-center gap-2">
                        <Icon name="bell" className="text-primary-600" />
                        <span className="text-xs text-neutral-600">bell</span>
                      </div>
                      <div className="flex flex-col items-center gap-2">
                        <Icon name="mail" className="text-primary-600" />
                        <span className="text-xs text-neutral-600">mail</span>
                      </div>
                      <div className="flex flex-col items-center gap-2">
                        <Icon name="heart" className="text-error-DEFAULT" />
                        <span className="text-xs text-neutral-600">heart</span>
                      </div>
                      <div className="flex flex-col items-center gap-2">
                        <Icon name="star" className="text-warning-DEFAULT" />
                        <span className="text-xs text-neutral-600">star</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Design Tokens Info */}
            <Card variant="outlined">
              <CardHeader>
                <CardTitle>Design Tokens Integration</CardTitle>
                <CardDescription>
                  All components use centralized design tokens from
                  src/design/tokens.ts
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <h4 className="mb-2 font-semibold text-neutral-900">
                      Colors
                    </h4>
                    <p className="text-sm text-neutral-600">
                      Primary, secondary, neutral, and semantic color scales
                      (success, error, warning, info)
                    </p>
                  </div>
                  <div>
                    <h4 className="mb-2 font-semibold text-neutral-900">
                      Typography
                    </h4>
                    <p className="text-sm text-neutral-600">
                      Font families, sizes, weights, line heights, and letter
                      spacing
                    </p>
                  </div>
                  <div>
                    <h4 className="mb-2 font-semibold text-neutral-900">
                      Spacing
                    </h4>
                    <p className="text-sm text-neutral-600">
                      Consistent spacing scale from 0.125rem to 24rem
                    </p>
                  </div>
                  <div>
                    <h4 className="mb-2 font-semibold text-neutral-900">
                      Effects
                    </h4>
                    <p className="text-sm text-neutral-600">
                      Border radius, shadows, and other visual effects
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Modal */}
        <Modal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          size="md"
          closeOnOverlayClick
          showCloseButton
        >
          <ModalHeader>
            <ModalTitle>Confirm Action</ModalTitle>
          </ModalHeader>
          <ModalBody>
            <p className="text-neutral-700">
              This is a modal dialog demonstrating the Modal component with
              proper accessibility features including:
            </p>
            <ul className="mt-3 list-inside list-disc space-y-1 text-sm text-neutral-600">
              <li>Escape key to close</li>
              <li>Click outside to dismiss</li>
              <li>Body scroll lock when open</li>
              <li>Smooth animations with Framer Motion</li>
            </ul>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" onClick={handleCloseModal}>
              Cancel
            </Button>
            <Button onClick={handleModalConfirm}>Confirm</Button>
          </ModalFooter>
        </Modal>
      </div>
    </PageTransition>
  );
}
