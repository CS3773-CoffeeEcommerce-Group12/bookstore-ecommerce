'use client';

import { useState } from 'react';
import { Button, Card, CardHeader, CardTitle, CardContent, CardFooter, Input, Textarea, Table, TableHeader, TableBody, TableRow, TableHead, TableCell, Modal, ModalFooter } from '@/components/ui';

export default function ComponentShowcase() {
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">🎨 UI Component Library</h1>
        <p className="text-gray-600 mb-8">Reusable components for the bookstore e-commerce project</p>

        {/* Buttons */}
        <Card>
          <CardHeader>
            <CardTitle>Buttons</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex flex-wrap gap-3 items-center">
                <span className="text-sm font-medium text-gray-700 w-24">Primary:</span>
                <Button size="sm">Small</Button>
                <Button size="md">Medium</Button>
                <Button size="lg">Large</Button>
                <Button disabled>Disabled</Button>
              </div>
              <div className="flex flex-wrap gap-3 items-center">
                <span className="text-sm font-medium text-gray-700 w-24">Outline:</span>
                <Button variant="outline" size="sm">Small</Button>
                <Button variant="outline" size="md">Medium</Button>
                <Button variant="outline" size="lg">Large</Button>
              </div>
              <div className="flex flex-wrap gap-3 items-center">
                <span className="text-sm font-medium text-gray-700 w-24">Ghost:</span>
                <Button variant="ghost" size="sm">Small</Button>
                <Button variant="ghost" size="md">Medium</Button>
                <Button variant="ghost" size="lg">Large</Button>
              </div>
              <div className="flex flex-wrap gap-3 items-center">
                <span className="text-sm font-medium text-gray-700 w-24">Danger:</span>
                <Button variant="danger" size="sm">Delete</Button>
                <Button variant="danger" size="md">Remove</Button>
                <Button variant="danger" size="lg">Cancel</Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Cards */}
        <Card>
          <CardHeader>
            <CardTitle>Cards</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card padding="sm">
                <p className="text-sm text-gray-600">Small padding card</p>
              </Card>
              <Card padding="md">
                <p className="text-sm text-gray-600">Medium padding card (default)</p>
              </Card>
              <Card padding="lg">
                <p className="text-sm text-gray-600">Large padding card</p>
              </Card>
            </div>
            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card hover>
                <CardHeader>
                  <CardTitle>Hover Card</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600">Hover over me to see animation</p>
                </CardContent>
                <CardFooter>
                  <Button size="sm" variant="outline">Action</Button>
                </CardFooter>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Regular Card</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600">No hover animation</p>
                </CardContent>
                <CardFooter>
                  <Button size="sm">Click Me</Button>
                </CardFooter>
              </Card>
            </div>
          </CardContent>
        </Card>

        {/* Inputs */}
        <Card>
          <CardHeader>
            <CardTitle>Inputs & Textareas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 max-w-xl">
              <Input label="Email Address" placeholder="Enter your email" type="email" />
              <Input label="Password" placeholder="Enter password" type="password" helperText="Must be at least 8 characters" />
              <Input label="Search" placeholder="Search books..." defaultValue="React Patterns" />
              <Input label="Error Example" placeholder="Invalid input" error="This field is required" />
              <Input label="Disabled" placeholder="Cannot edit" disabled />
              <Textarea label="Description" placeholder="Enter a description..." rows={4} helperText="Maximum 500 characters" />
            </div>
          </CardContent>
        </Card>

        {/* Tables */}
        <Card>
          <CardHeader>
            <CardTitle>Tables</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead sortable sortDirection="asc">Book Name</TableHead>
                  <TableHead sortable sortDirection={null}>Author</TableHead>
                  <TableHead sortable sortDirection="desc">Price</TableHead>
                  <TableHead>Stock</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell>The Great Gatsby</TableCell>
                  <TableCell>F. Scott Fitzgerald</TableCell>
                  <TableCell>$12.99</TableCell>
                  <TableCell><span className="text-green-600">25 in stock</span></TableCell>
                  <TableCell>
                    <Button size="sm" variant="ghost">Edit</Button>
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>To Kill a Mockingbird</TableCell>
                  <TableCell>Harper Lee</TableCell>
                  <TableCell>$14.50</TableCell>
                  <TableCell><span className="text-green-600">18 in stock</span></TableCell>
                  <TableCell>
                    <Button size="sm" variant="ghost">Edit</Button>
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>1984</TableCell>
                  <TableCell>George Orwell</TableCell>
                  <TableCell>$13.25</TableCell>
                  <TableCell><span className="text-red-600">Out of stock</span></TableCell>
                  <TableCell>
                    <Button size="sm" variant="ghost">Edit</Button>
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Modal */}
        <Card>
          <CardHeader>
            <CardTitle>Modal</CardTitle>
          </CardHeader>
          <CardContent>
            <Button onClick={() => setModalOpen(true)}>Open Modal</Button>
          </CardContent>
        </Card>

        <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Example Modal" size="md">
          <p className="text-gray-600 mb-4">
            This is an example modal dialog. It includes a title, content area, and action buttons.
          </p>
          <Input label="Name" placeholder="Enter your name" />
          <ModalFooter>
            <Button variant="outline" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button onClick={() => setModalOpen(false)}>Save Changes</Button>
          </ModalFooter>
        </Modal>

        {/* Color Palette */}
        <Card>
          <CardHeader>
            <CardTitle>Color Palette</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <div className="h-20 bg-blue-600 rounded-lg mb-2"></div>
                <p className="text-sm font-medium">Primary Blue</p>
                <p className="text-xs text-gray-500">blue-600</p>
              </div>
              <div>
                <div className="h-20 bg-gray-900 rounded-lg mb-2"></div>
                <p className="text-sm font-medium">Text Dark</p>
                <p className="text-xs text-gray-500">gray-900</p>
              </div>
              <div>
                <div className="h-20 bg-green-500 rounded-lg mb-2"></div>
                <p className="text-sm font-medium">Success Green</p>
                <p className="text-xs text-gray-500">green-500</p>
              </div>
              <div>
                <div className="h-20 bg-red-600 rounded-lg mb-2"></div>
                <p className="text-sm font-medium">Error Red</p>
                <p className="text-xs text-gray-500">red-600</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Design Principles */}
        <Card>
          <CardHeader>
            <CardTitle>Design Principles</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">✅ Spacing</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Consistent padding: p-4, p-6</li>
                  <li>• Gap utilities: gap-4, space-y-4</li>
                  <li>• Margin for separation: mb-4, mt-6</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">✅ Borders & Shadows</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Rounded corners: rounded-lg, rounded-xl</li>
                  <li>• Card shadows: shadow-md</li>
                  <li>• Modal shadows: shadow-2xl</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">✅ Hover States</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Button hover: hover:bg-blue-700</li>
                  <li>• Card hover: hover:shadow-lg</li>
                  <li>• Link hover: hover:underline</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">✅ Accessibility</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Focus rings: focus:ring-2</li>
                  <li>• Disabled states: disabled:opacity-50</li>
                  <li>• ARIA labels: aria-label, sr-only</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Usage Examples */}
        <Card>
          <CardHeader>
            <CardTitle>Import & Usage</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto">
              <pre className="text-sm">
{`// Import all components from a single entry point
import { Button, Card, Input, Table, Modal } from '@/components/ui';

// Use in your components
<Button variant="primary" size="lg">
  Click Me
</Button>

<Card padding="md" hover>
  <CardHeader>
    <CardTitle>My Card</CardTitle>
  </CardHeader>
  <CardContent>
    Content goes here
  </CardContent>
</Card>

<Input 
  label="Email" 
  placeholder="Enter email" 
  error="Invalid email"
/>`}
              </pre>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
