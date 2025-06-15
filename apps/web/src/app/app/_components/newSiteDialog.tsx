'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  Button,
  Input,
} from 'ui';
import { createSite } from '../_actions/sites';

interface Props {
  onSiteCreated: () => void;
}

export default function NewSiteDialog({ onSiteCreated }: Props) {
  const [open, setOpen] = useState(false);
  const [url, setUrl] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await createSite({ url, name });
      setOpen(false);
      onSiteCreated();
    } catch (error) {
      console.error('Failed to create site:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>Add New Site</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add New Site</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className='space-y-4'>
          <div>
            <label htmlFor='url' className='block mb-1 text-sm font-medium'>
              URL
            </label>
            <Input
              id='url'
              value={url}
              onChange={e => setUrl(e.target.value)}
              placeholder='https://example.com'
              required
            />
          </div>
          <div>
            <label htmlFor='name' className='block mb-1 text-sm font-medium'>
              Name
            </label>
            <Input
              id='name'
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder='My Site'
            />
          </div>
          <Button type='submit' disabled={loading}>
            {loading ? 'Creating...' : 'Create Site'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
